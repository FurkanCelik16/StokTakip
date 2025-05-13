import React, { useState, useEffect } from 'react';
import { Modal, Table, message, Button, DatePicker } from 'antd';
import { fetchLogs } from '../api/sheets';

const { RangePicker } = DatePicker;

const ReportModal = ({ open, onClose, userId, productId }) => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            fetchLogs(userId)
                .then((data) => {
                    const filtered = productId
                        ? data.filter(log => String(log.productId) === String(productId))
                        : data;
                    setLogs(filtered);
                    setFilteredLogs(filtered);
                })
                .catch(() => {
                    message.error('Loglar alınırken hata oluştu.');
                })
                .finally(() => setLoading(false));
        }
    }, [open, userId, productId]);

    const handleDateRangeChange = (dates) => {
        setSelectedDateRange(dates);
    };

    const handleFilterLogs = () => {
        if (selectedDateRange) {
            const [start, end] = selectedDateRange;
            const filtered = logs.filter(log => {
                const logDate = new Date(log.timeStamp);
                if (end) {
                    
                    return logDate >= start.toDate() && logDate <= end.toDate();
                } else {
                    
                    return logDate.toDateString() === start.toDate().toDateString();
                }
            });
            setFilteredLogs(filtered);
        } else {
            setFilteredLogs(logs); 
        }
    };

    const disabledDate = (current) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); 
        return current && current > today;
    };

    const handleModalClose = () => {
        setSelectedDateRange(null); 
        setFilteredLogs(logs); 
        onClose(); 
    };

    const columns = [
        {
            title: 'Tarih',
            dataIndex: 'timeStamp',
            key: 'timeStamp',
            sorter: (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp), // Tarih sıralama
            render: (text) => {
                const date = new Date(text);
                return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            }
        },
        { title: 'Ürün İsmi', dataIndex: 'productName', key: 'productName' },
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
                onCancel={handleModalClose} 
                footer={null}
                width={800}
            >
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                    <RangePicker
                        onChange={handleDateRangeChange}
                        disabledDate={disabledDate} 
                        style={{ marginRight: 16 }}
                        value={selectedDateRange} 
                    />
                    <Button onClick={handleFilterLogs} type="primary" style={{ marginRight: 16 }}>
                        Görüntüle
                    </Button>
                    <Button onClick={handleSendReport} type="primary" style={{ backgroundColor: 'grey' }}>
                        Rapor Gönder
                    </Button>
                </div>
                <Table
                    dataSource={filteredLogs}
                    columns={columns}
                    rowKey={(record, index) => index}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>
        </>
    );
};

export default ReportModal;