import React from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import { addProduct, updateProduct, isBarcodeDuplicate, fetchUserProducts } from '../api/sheets';

function UpdateProductModal({
    isModalVisible,
    setIsModalVisible,
    isEditMode,
    setIsEditMode,
    currentProductId,
    setCurrentProductId,
    form,
    user,
    setUrunler,
    setFilteredUrunler,
}) {
   
     const [messageApi, contextHolder] = message.useMessage();

    const handleAddProduct = async (values) => {
    const newProduct = {
        userId: parseInt(user.userId),
        productName: values.productName,
        productId: values.productId,
        barcodeNo: values.barcodeNo,
        price: parseFloat(values.price),
        stockquantity: parseInt(values.stockquantity),
    };

    try {
        const isDuplicate = await isBarcodeDuplicate(newProduct.barcodeNo, newProduct.userId);
        if (isDuplicate) {
            messageApi.open({ type: 'error', content: "Bu barkod numarasına sahip bir ürün zaten var." });
            return;
        }

        await addProduct(newProduct);
        messageApi.open({ type: 'success', content: "Ürün başarıyla eklendi!" });

        const refreshed = await fetchUserProducts(user.userId);
        setUrunler(refreshed);
        setFilteredUrunler(refreshed);

        closeModal();
    } catch (error) {
        console.error("Detaylı Axios hatası:", error.message);
        messageApi.open({ type: 'error', content: "Ürün eklenirken hata oluştu." });
    }
};

        const handleUpdateProduct = async (values) => {
    const updatedProduct = {
        id: currentProductId,
        productName: values.productName,
        productId: values.productId,
        barcodeNo: values.barcodeNo,
        price: parseFloat(values.price),
        stockquantity: parseInt(values.stockquantity),
    };

    try {
        const isDuplicate = await isBarcodeDuplicate(updatedProduct.barcodeNo, user.userId, currentProductId);
        if (isDuplicate) {
            messageApi.open({ type: 'error', content: "Bu barkod numarasına sahip başka bir ürün zaten var." });
            return;
        }

        await updateProduct(currentProductId, updatedProduct, user.userId);
        messageApi.open({ type: 'success', content: "Ürün başarıyla güncellendi!" });

        const refreshed = await fetchUserProducts(user.userId);
        setUrunler(refreshed);
        setFilteredUrunler(refreshed);

        closeModal();
    } catch (error) {
        console.error(error);
        messageApi.open({ type: 'error', content: "Ürün güncellenirken hata oluştu." });
    }
};
        

    const closeModal = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setCurrentProductId(null);
    form.resetFields();
};
        
    return (
        <>
{contextHolder}
    <Modal
                title={isEditMode ? "Ürün Güncelle" : "Yeni Ürün Ekle"}
                open={isModalVisible}
                onCancel={(closeModal)}
                footer={null}
            >
                <Form form={form} onFinish={isEditMode ? handleUpdateProduct : handleAddProduct} layout="vertical">
                    <Form.Item
                        label="Ürün Adı"
                        name="productName"
                        rules={[{ required: true, message: 'Ürün adı gereklidir!' }]}
                    >
                        <Input />
                    </Form.Item>
                   <Form.Item
    label="Barkod No"
    name="barcodeNo"
    rules={[{ required: true, message: 'Barkod numarası gereklidir!' }]}
>
    <Input
        type="text" 
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, ''); 
        }}
    />
</Form.Item>
<Form.Item
    label="Fiyat"
    name="price"
    rules={[{ required: true, message: 'Fiyat gereklidir!' }]}
>
    <Input
        type="text"
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9.]/g, ''); 
            if ((e.target.value.match(/\./g) || []).length > 1) {
                e.target.value = e.target.value.slice(0, -1); 
            }
        }}
    />
</Form.Item>

<Form.Item
    label="Stok Adedi"
    name="stockquantity"
    rules={[{ required: true, message: 'Stok adedi gereklidir!' }]}
>
    <Input
        type="number"
        min={0}
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '',); 
        }}
    />
</Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {isEditMode ? "Güncelle" : "Ürün Ekle"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
    </>
);
}

export default UpdateProductModal;