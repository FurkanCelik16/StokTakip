import { useEffect, useState } from 'react';
import {Layout, Menu, theme, Table, message, Modal, Form, Input, Button,  } from 'antd';
import { DropboxOutlined, LogoutOutlined } from '@ant-design/icons';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProducts , deleteProductWithLogs,sellProduct } from '../api/sheets';
import '../css/Home.css';
import ReportModal from '../components/ReportModal';
import UpdateProductModal from '../components/UpdateProductModal';
import { getColumns } from '../components/tableColumns';
import SellModal from '../components/SellModal';


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
        await deleteProductWithLogs(productId, user.userId, setUrunler, setFilteredUrunler, messageApi);

        setUrunler((prevUrunler) => prevUrunler.filter((urun) => urun.id !== productId));
        setFilteredUrunler((prevFilteredUrunler) => prevFilteredUrunler.filter((urun) => urun.id !== productId));

    } catch (error) {
        console.error('Ürün silinirken hata oluştu:', error);
        messageApi.error('Ürün silinirken hata oluştu.');
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


const handleSellProduct = (product) => {
    setSelectedProductForSell(product); 
    setSellQuantity(1); 
    setIsSellModalVisible(true); 
};

const handleConfirmSell = () => {
    if (!selectedProductForSell) return;
    sellProduct(selectedProductForSell, sellQuantity, user.userId, urunler, setUrunler, setFilteredUrunler, messageApi);
};

    const handleLogout = () => {
        setUser(null); 
        navigate('/'); 
    };

    const handleSendReport = () => {
    messageApi.success('Mail başarıyla gönderildi.');
};

   const columns = getColumns({
    handleEditProduct,
    handleDeleteProduct,
    handleSellProduct,
    handleViewLogs,
    handleSendReport,
});

    return (
        <Layout>
            {contextHolder}
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={[{ key: '1', label: <span style={{color:'white'}}>Ana Sayfa</span> }]}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <h2 style={{color:'white', marginRight:250 , marginTop:5}}>Stok Takip Uygulaması</h2>

<Search
  placeholder="Barkod Numarası Giriniz"
  onChange={handleSearch}
  onSearch={handleSearch}
        type="text" 
        onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
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
                                    { key: '3', label: 'Raporlar', onClick: () => handleViewAllLogs() }, 
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
                        <h2 style={{marginLeft:3, marginTop:15}}>Ürünleriniz</h2>
                        <Table
  dataSource={filteredUrunler}
  columns={columns}
  rowKey={(record) => record.id}
  style={{ marginTop: 16 }}
/>
                    </Content>
                </Layout>
            </Layout>

           <UpdateProductModal
    isModalVisible={isModalVisible}
    setIsModalVisible={setIsModalVisible}
    isEditMode={isEditMode}
    setIsEditMode={setIsEditMode}
    currentProductId={currentProductId}
    setCurrentProductId={setCurrentProductId}
    form={form}
    user={user}
    setUrunler={setUrunler}
    setFilteredUrunler={setFilteredUrunler}
/>
            
            <ReportModal
    open={isReportModalOpen}
    onClose={() => setIsReportModalOpen(false)}
    userId={user?.userId}
    productId={selectedProductId} 
/>
<SellModal
    isSellModalVisible={isSellModalVisible}
    setIsSellModalVisible={setIsSellModalVisible}
    handleConfirmSell={handleConfirmSell}
    selectedProductForSell={selectedProductForSell}
    sellQuantity={sellQuantity}
    setSellQuantity={setSellQuantity}
/>;

        </Layout>
        
    );
};

export default Home;
