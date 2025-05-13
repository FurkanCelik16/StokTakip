import React, { useEffect, useState } from 'react';
import { Space, Layout, Menu, theme, Table, message, Modal, Form, Input, Button, notification } from 'antd';
import { DropboxOutlined, LogoutOutlined } from '@ant-design/icons';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProducts, addProduct, updateProduct, deleteProduct, isBarcodeDuplicate } from '../api/sheets';
import '../css/Home.css';
import ReportModal from '../components/ReportModal';


const { Header, Content, Sider } = Layout;

const Home = () => {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();
    const [urunler, setUrunler] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isEditMode, setIsEditMode] = useState(false); 
    const [currentProductId, setCurrentProductId] = useState(null); 
    const [filteredUrunler, setFilteredUrunler] = useState([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null); 
    const [isSellModalVisible, setIsSellModalVisible] = useState(false); 
const [sellQuantity, setSellQuantity] = useState(1); 
const [selectedProductForSell, setSelectedProductForSell] = useState(null); 

    const [messageApi, contextHolder] = message.useMessage();

    const handleViewLogs = (productId) => {
    setSelectedProductId(productId);
    setIsReportModalOpen(true);
};
    
    
    const handleViewAllLogs = () => {
        setSelectedProductId(null); 
        setIsReportModalOpen(true);
    };
    
    const { Search } = Input;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
    if (!user || !user.userId) {
        navigate('/');
    } else {
        fetchUserProducts(user.userId)
            .then(products => {
                setUrunler(products);
                setFilteredUrunler(products);
            })
            .catch(error => {
                messageApi.error("Ürünler alınırken hata oluştu.");
                console.error(error);
            });
    }
}, [user]);

    

      

    
    const handleEditProduct = (product) => {
        setIsEditMode(true);
        setCurrentProductId(product.id);

        form.setFieldsValue({
            productName: product.productName,
            barcodeNo: product.barcodeNo,
            price: product.price,
            stockquantity: product.stockquantity
        });
        setIsModalVisible(true);
    };

    const handleDeleteProduct = async (productId) => {
    try {
        await deleteProduct(productId);
        messageApi.success('Ürün başarıyla silindi.');
        fetchUserProducts(user.userId).then(products => {
    setUrunler(products);
    setFilteredUrunler(products);
});

    } catch (error) {
        console.error(error);   
        messageApi.error('Ürün silinirken hata oluştu.');
    }
};

    
    const handleAddProduct = async (values) => {
        const newProduct = {
            userId: parseInt(user.userId),
            productName: values.productName,
            barcodeNo: values.barcodeNo,
            price: parseFloat(values.price),
            stockquantity: parseInt(values.stockquantity),
        };
    
        try {
            const isDuplicate = await isBarcodeDuplicate(newProduct.barcodeNo, newProduct.userId);
            if (isDuplicate) {
                messageApi.error("Bu barkod numarasına sahip bir ürün zaten var.");
                return;
            }
    
            const successMessage = await addProduct(newProduct);
            messageApi.success(successMessage);
            setIsModalVisible(false);
            form.resetFields();
            fetchUserProducts(user.userId).then(setUrunler);
        } catch (error) {
            console.error("Detaylı Axios hatası:", error.message);
            messageApi.error("Ürün eklenirken hata oluştu.");
        }
    };
    

    
    const handleUpdateProduct = async (values) => {
    const updatedProduct = {
        id: currentProductId, 
        productName: values.productName,
        barcodeNo: values.barcodeNo,
        price: parseFloat(values.price),
        stockquantity: parseInt(values.stockquantity),
    };

    try {
        const isDuplicate = await isBarcodeDuplicate(updatedProduct.barcodeNo, user.userId, currentProductId);
        if (isDuplicate) {
            messageApi.error("Bu barkod numarasına sahip başka bir ürün zaten var.");
            return;
        }

        await updateProduct(currentProductId, updatedProduct, user.userId);
        messageApi.success("Ürün başarıyla güncellendi!");

        const refreshed = await fetchUserProducts(user.userId);
        setUrunler(refreshed);
        setFilteredUrunler(refreshed);

        setIsModalVisible(false);
        form.resetFields();
        setIsEditMode(false);
    } catch (error) {
        messageApi.error("Ürün güncellenirken hata oluştu.");
        console.error(error);
    }
};
        

    const handleSearch = (e) => {
    const value = typeof e === "string" ? e : e.target.value;
    const searchTerm = value.trim();
    setFilteredUrunler(
        searchTerm === ""
            ? urunler
            : urunler.filter(item =>
                item.barcodeNo.toString().includes(searchTerm)
            )
    );
};

    
    const closeModal = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setCurrentProductId(null);
    form.resetFields();
};

const handleSellProduct = (product) => {
    setSelectedProductForSell(product); 
    setSellQuantity(1); 
    setIsSellModalVisible(true); 
};

const handleConfirmSell = async () => {
    if (!selectedProductForSell) return;

    try {
        const product = selectedProductForSell;
        if (product.stockquantity >= sellQuantity) {
            
            const updatedProduct = { ...product, stockquantity: product.stockquantity - sellQuantity };

            
            await updateProduct(product.id, updatedProduct, user.userId);

            
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
    } finally {
        setIsSellModalVisible(false); 
    }
};

    


    const handleLogout = () => {
        setUser(null); 
        navigate('/'); 
    };

    const handleSendReport = () => {
    messageApi.success('Mail başarıyla gönderildi.');
};

    const columns = [
    { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName' },
    { title: 'Barkod No', dataIndex: 'barcodeNo', key: 'barcodeNo' },
    { title: 'Fiyat (₺)', dataIndex: 'price', key: 'price' , render: (text) => `${text} ₺`},
    { title: 'Stok Adedi', dataIndex: 'stockquantity', key: 'stockquantity' },
    {
        title: 'İşlemler',
        key: 'actions',
        render: (text, record) => (
            <span>
                <Button onClick={() => handleEditProduct(record)} type="primary">
                    Düzenle
                </Button>
                <Button onClick={() => handleDeleteProduct(record.id)} type="primary" danger style={{ marginLeft: 8 }}>
                    Sil
                </Button>
                <Button
    onClick={() => handleSellProduct(record)}
    type="primary"
    style={{ marginLeft: 8, backgroundColor: 'green' }}
>
    Satış Yap
</Button>
                <Button onClick={() => handleViewLogs(record.id)} type="primary" style={{ marginLeft: 8, backgroundColor: 'blue' }}>
                    Rapor Görüntüle
                </Button>
                <Button onClick={() => handleSendReport()} type="primary" style={{ marginLeft: 8, backgroundColor: 'grey' }}>
                    Rapor Gönder
                </Button>
            </span>
        ),
    },
];

    return (
        <Layout>
            {contextHolder}
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={[{ key: '1', label: 'Ana Sayfa' }]}
                    style={{ flex: 1, minWidth: 0 }}
                />

<Search
  placeholder="Barkod Numarası Giriniz"
  onChange={handleSearch}
  onSearch={handleSearch}
        type="text" 
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Sadece rakamlara izin ver
        }}
  enterButton
  style={{ width: 300, marginRight: 40 }}
/>


                <Button 
                    type="primary" 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                    style={{ marginLeft: 'auto' }}
                >
                    Çıkış Yap
                </Button>

                
            </Header>
            <Layout>
                <Sider width={200} style={{ background: colorBgContainer }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={[
                            {
                                key: 'sub1',
                                icon: <DropboxOutlined />,
                                label: 'Ürün İşlemleri',
                                children: [
                                    { key: '1', label: 'Ürün Listesi' },
                                    { key: '2', label: 'Ürün Ekle', onClick: () => setIsModalVisible(true) },
                                    { key: '3', label: 'Raporlar', onClick: () => handleViewAllLogs() }, // Tüm logları göster
,
                                ],
                            },
                        ]}
                    />
                </Sider>
                <Layout style={{ padding: '0 24px 24px', marginTop: 40 }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 600,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <h2>Ürünleriniz</h2>
                        <Table
  dataSource={filteredUrunler}
  columns={columns}
  rowKey={(record) => record.id}
/>
                    </Content>
                </Layout>
            </Layout>

            {/* Ürün Ekleme/Güncelleme Modalı */}
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
        type="text" // "number" yerine "text" kullanıyoruz çünkü "number" negatif değerleri engellemiyor
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Sadece rakamlara izin ver
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
                e.target.value = e.target.value.slice(0, -1); // Birden fazla ondalık işaretine izin verme
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
            <ReportModal
    open={isReportModalOpen}
    onClose={() => setIsReportModalOpen(false)}
    userId={user?.userId}
    productId={selectedProductId} 
/>
<Modal
    title="Satış Yap"
    open={isSellModalVisible}
    onCancel={() => setIsSellModalVisible(false)}
    onOk={handleConfirmSell}
    okText="Satış Yap"
    cancelText="İptal"
>
    <p>{selectedProductForSell?.productName} ürününden kaç adet satmak istiyorsunuz?</p>
    <Input
        type="number"
        max={selectedProductForSell?.stockquantity || 0}
        value={sellQuantity}
        onChange={(e) => setSellQuantity(parseInt(e.target.value) || 0 )}
    />
</Modal>

        </Layout>
        
    );
};

export default Home;
