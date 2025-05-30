import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, ShoppingCartOutlined, FileSearchOutlined, MailOutlined } from '@ant-design/icons';

export const getColumns = ({
    handleEditProduct,
    handleDeleteProduct,
    handleSellProduct,
    handleViewLogs,
    handleSendReport,
}) => [
    { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName' },
    { title: 'Barkod No', dataIndex: 'barcodeNo', key: 'barcodeNo' },
    { title: 'Fiyat (₺)', dataIndex: 'price', key: 'price', render: (text) => `${text} ₺` },
    { title: 'Stok Adedi', dataIndex: 'stockquantity', key: 'stockquantity' },
    {
        title: 'İşlemler',
        key: 'actions',
        render: (text, record) => (
            <span>
              
                <Button
                    onClick={() => handleEditProduct(record)}
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ marginLeft: 8 }}
                >
                    Düzenle
                </Button>

                <Popconfirm
                    title="Emin misiniz?"
                    onConfirm={() => handleDeleteProduct(record.id)}
                    okText="Evet"
                    cancelText="Hayır"
                >
                    <Button
                        type="primary"
                        danger
                        style={{ marginLeft: 8 }}
                        icon={<DeleteOutlined />}
                    >
                        Sil
                    </Button>
                </Popconfirm>

                <Button
                    onClick={() => handleSellProduct(record)}
                    type="primary"
                    style={{ marginLeft: 8, backgroundColor: 'green', color: 'white' }}
                    icon={<ShoppingCartOutlined />}
                >
                    Satış Yap
                </Button>

                <Button
                    onClick={() => handleViewLogs(record.id)}
                    type="primary"
                    style={{ marginLeft: 8, backgroundColor: 'blue', color: 'white' }}
                    icon={<FileSearchOutlined />}
                >
                    Rapor Görüntüle
                </Button>

                <Button
                    onClick={() => handleSendReport()}
                    type="primary"
                    style={{ marginLeft: 8, backgroundColor: 'grey', color: 'white' }}
                    icon={<MailOutlined />}
                >
                    Rapor Gönder
                </Button>
            </span>
        ),
    },
];