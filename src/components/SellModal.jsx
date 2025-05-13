import React from 'react';
import { Modal, Input } from 'antd';

const SellModal = ({
    isSellModalVisible,
    setIsSellModalVisible,
    handleConfirmSell,
    selectedProductForSell,
    sellQuantity,
    setSellQuantity,
}) => (
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
            onChange={(e) => setSellQuantity(parseInt(e.target.value) || 0)}
        />
    </Modal>
);

export default SellModal;