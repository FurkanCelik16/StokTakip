import React from 'react';
import { Button, Table } from 'antd';

const ProductTable = ({ urunler, handleEditProduct, handleDeleteProduct, handleSellProduct, handleViewLogs, handleSendReport }) => {
  const columns = [
    { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName' },
    { title: 'Barkod No', dataIndex: 'barcodeNo', key: 'barcodeNo' },
    { title: 'Fiyat (₺)', dataIndex: 'price', key: 'price', render: (text) => `${text} ₺` },
    { title: 'Stok Adedi', dataIndex: 'stockquantity', key: 'stockquantity' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEditProduct(record)} type="primary">Düzenle</Button>
          <Button danger onClick={() => handleDeleteProduct(record.id)} style={{ marginLeft: 8 }}>Sil</Button>
          <Button style={{ marginLeft: 8, backgroundColor: 'green', color: 'white' }} onClick={() => handleSellProduct(record)}>Satış Yap</Button>
          <Button style={{ marginLeft: 8, backgroundColor: 'blue', color: 'white' }} onClick={() => handleViewLogs(record.id)}>Rapor Görüntüle</Button>
          <Button style={{ marginLeft: 8, backgroundColor: 'grey', color: 'white' }} onClick={() => handleSendReport()}>Rapor Gönder</Button>
        </>
      )
    }
  ];

  return <Table dataSource={urunler} columns={columns} rowKey="id" style={{ marginTop: 16 }} />;
};

export default ProductTable;
