// src/api/sheets.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const urlProducts = `${BASE_URL}/products`;
const urlUsers = `${BASE_URL}/users`;



export const fetchLogs = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/logs`);
        return response.data.logs
            .filter(log => String(log.userId) === String(userId))
            .map(log => ({
                timeStamp: log.timeStamp,
                productName: log.productName, // Ürün ismini döndür
                productId: log.productId,
                barcodeNo: log.barcodeNo,
                operation: log.operation,
                oldstockValue: log.oldstockValue,
                newStockValue: log.newStockValue,
            }));
    } catch (error) {
        console.error("Logları çekerken hata oluştu:", error.response?.data || error.message);
        return [];
    }
};

  

export const fetchUsers = async () => {
    try {
        const response = await axios.get(urlUsers);
        return response.data.users;
    } catch (error) {
        throw new Error('Sunucuya bağlanılamadı.');
    }
};

export const fetchUserProducts = async (userId) => {
    try {
        const response = await axios.get(urlProducts);
        const allProducts = response.data.products;
        return allProducts.filter(p => p.userId === parseInt(userId));
    } catch (error) {
        throw new Error("Ürünler alınırken hata oluştu.");
    }
};


export const isBarcodeDuplicate = async (barcodeNo, userId, excludeId = null) => {
    try {
        const response = await axios.get(urlProducts);
        const products = response.data.products;

        return products.some(p =>
            p.barcodeNo === barcodeNo &&
            p.userId === parseInt(userId) &&
            (excludeId ? p.id !== excludeId : true)
        );
    } catch (error) {
        console.error("Barkod kontrolünde hata:", error);
        throw new Error("Barkod kontrolünde hata oluştu.");
    }
};


export const addProduct = async (newProduct) => {
    try {
        
        const response = await axios.post(urlProducts, { product: newProduct }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const addedProduct = response.data.product;

        
        const logData = {
            log: {
                timeStamp: new Date().toISOString(),
                userId: addedProduct.userId,
                productId: addedProduct.id, 
                productName: addedProduct.productName, 
                barcodeNo: addedProduct.barcodeNo,
                operation: "Ürün eklendi",
                oldstockValue: 0,
                newStockValue: addedProduct.stockquantity,
            }
        };

        await axios.post(`${BASE_URL}/logs`, logData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return addedProduct; 
    } catch (error) {
        console.error("Add Product Error: ", error.response?.data || error.message);
        throw new Error("Ürün eklenirken hata oluştu.");
    }
};


export const updateProduct = async (productId, updatedProduct, userId) => {
    try {
        const url = `${urlProducts}/${productId}`;

        const productResponse = await axios.get(url);
        const oldProduct = productResponse.data.product;

       
        const response = await axios.put(url, { product: updatedProduct }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (oldProduct.stockquantity !== updatedProduct.stockquantity) {
            const logData = {
                log: {
                    timeStamp: new Date().toISOString(),
                    userId: userId,
                    productId: productId,
                    productName: updatedProduct.productName, 
                    barcodeNo: updatedProduct.barcodeNo,
                    operation: "Stok güncellendi",
                    oldstockValue: oldProduct.stockquantity,
                    newStockValue: updatedProduct.stockquantity,
                }
            };

            await axios.post(`${BASE_URL}/logs`, logData, {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return response.data.product;
    } catch (error) {
        console.error("Update Error: ", error.response?.data || error.message);
        throw new Error("Ürün güncellenirken hata oluştu.");
    }
};


export const deleteProduct = async (productId) => {
    try {
        const url = `${urlProducts}/${productId}`;

        // Silinecek ürünün bilgilerini alın
        const productResponse = await axios.get(url);
        const deletedProduct = productResponse.data.product;

        // Ürünü sil
        await axios.delete(url);

        // Log ekleme işlemi
        const logData = {
            log: {
                timeStamp: new Date().toISOString(),
                userId: deletedProduct.userId,
                productId: deletedProduct.id, 
                productName: deletedProduct.productName, 
                barcodeNo: deletedProduct.barcodeNo,
                operation: "Ürün silindi",
                oldstockValue: deletedProduct.stockquantity,
                newStockValue: 0,
            }
        };

        // Logu Sheety API'ye gönderiyoruz
        await axios.post(`${BASE_URL}/logs`, logData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return "Ürün başarıyla silindi.";
    } catch (error) {
        console.error('Delete Error:', error.response?.data || error.message);
        throw new Error("Ürün silinirken hata oluştu.");
    }
};

export const deleteProductWithLogs = async (productId, userId, setUrunler, setFilteredUrunler, messageApi) => {
    try {
        await deleteProduct(productId); 
        messageApi.success('Ürün başarıyla silindi.');

        const products = await fetchUserProducts(userId);
        setUrunler(products);
        setFilteredUrunler(products);
    } catch (error) {
        console.error(error);
        messageApi.error('Ürün silinirken hata oluştu.');
    }
};

export const sellProduct = async (product, sellQuantity, userId, urunler, setUrunler, setFilteredUrunler, messageApi) => {
    try {
        if (product.stockquantity >= sellQuantity) {
            const updatedProduct = { ...product, stockquantity: product.stockquantity - sellQuantity };

            await updateProduct(product.id, updatedProduct, userId);

            const updatedList = urunler.map(item =>
                item.id === product.id ? updatedProduct : item
            );
            setUrunler(updatedList);
            setFilteredUrunler(updatedList);

            messageApi.success(`${sellQuantity} adet satış başarıyla yapıldı!`);
        } else {
            messageApi.error("Yeterli stok yok!");
        }
    } catch (error) {
        messageApi.error("Satış işlemi sırasında hata oluştu.");
        console.error(error);
    }
};

