// src/api/sheets.js
import axios from 'axios';

const BASE_URL = 'https://api.sheety.co/87926b666964685dae03d18b588e4e18/stokTakip';

const urlProducts = `${BASE_URL}/products`;
const urlUsers = `${BASE_URL}/users`;



export const fetchLogs = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/logs`);
        return response.data.logs
            .filter(log => String(log.userId) === String(userId))
            .map(log => ({
                timeStamp: log.timeStamp,
                userId: log.userId,
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
        // Yeni ürünü API'ye ekliyoruz
        const response = await axios.post(urlProducts, { product: newProduct }, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Log ekleme işlemi
        const logData = {
            log: {
                timeStamp: new Date().toISOString(), 
                userId: newProduct.userId, 
                barcodeNo: newProduct.barcodeNo, 
                operation: "Ürün eklendi", 
                oldstockValue: 0, 
                newStockValue: newProduct.stockquantity, 
            }
        };

        // Logu Sheety API'ye gönderiyoruz
        await axios.post(`${BASE_URL}/logs`, logData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return "Ürün başarıyla eklendi!";
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

       
        const productResponse = await axios.get(url);
        const deletedProduct = productResponse.data.product;

       
        await axios.delete(url);

        
        const logData = {
            log: {
                timeStamp: new Date().toISOString(),
                userId: deletedProduct.userId,
                barcodeNo: deletedProduct.barcodeNo, 
                operation: "Ürün silindi",
                oldstockValue: deletedProduct.stockquantity, 
                newStockValue: null,
            }
        };

        await axios.post(`${BASE_URL}/logs`, logData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return "Ürün başarıyla silindi.";
    } catch (error) {
        console.error('Delete Error:', error.response?.data || error.message);
        throw new Error("Ürün silinirken hata oluştu.");
    }
};


