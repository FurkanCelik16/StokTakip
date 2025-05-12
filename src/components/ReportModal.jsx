import React, { useState, useEffect } from 'react';
import { Modal, Table, message ,Button } from 'antd';
import { fetchLogs } from '../api/sheets';


const ReportModal = ({ open, onClose, userId, productId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            fetchLogs(userId) // Kullanıcı ID'sine göre logları al
                .then((data) => {
                    // Eğer productId null ise tüm logları göster, değilse filtrele
                    const filteredLogs = productId
                        ? data.filter(log => String(log.productId) === String(productId))
                        : data;
                    setLogs(filteredLogs);
                })
                .catch(() => {
                    message.error('Loglar alınırken hata oluştu.');
                })
                .finally(() => setLoading(false));
        }
    }, [open, userId, productId]);

    const columns = [
       {
  title: 'Tarih',
  dataIndex: 'timeStamp',
  key: 'timeStamp',
  render: (text) => {
    const date = new Date(text);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
},

        { title: 'Kullanıcı ID', dataIndex: 'userId', key: 'userId' },
        { title: 'Barkod No', dataIndex: 'barcodeNo', key: 'barcodeNo' },
        { title: 'İşlem', dataIndex: 'operation', key: 'operation' },
        { title: 'Eski Stok Değeri', dataIndex: 'oldstockValue', key: 'oldstockValue' },
        { title: 'Yeni Stok Değeri', dataIndex: 'newStockValue', key: 'newStockValue' },
    ];

    const handleSendReport = () => {
    messageApi.success('Mail başarıyla gönderildi.');
};

    return (
        <>
            {contextHolder}
        <Modal
            title="Ürün Raporları"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Table
                dataSource={logs}
                columns={columns}
                rowKey={(record, index) => index}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Button onClick={() => handleSendReport()} type="primary" style={{ marginLeft: 8, backgroundColor: 'grey' }}>
                    Rapor Gönder
                </Button>
        </Modal>
        </>
    );
};

export default ReportModal;