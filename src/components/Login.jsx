import React, { useState } from 'react';
import '../css/Login.css';
import {
    Avatar,
    Button,
    Input,
    ConfigProvider,
    message
} from 'antd';
import {
    UserOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext'; 
import { fetchUsers } from '../api/sheets'; 


const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
            > span {
                position: relative;
            }
            &::before {
                content: '';
                background: linear-gradient(135deg, #6253e1, #04befe);
                position: absolute;
                inset: -1px;
                opacity: 1;
                transition: all 0.3s;
                border-radius: inherit;
            }
            &:hover::before {
                opacity: 0;
            }
        }
    `,
}));

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { styles } = useStyle();
    const navigate = useNavigate();
    const { setUser } = useUserContext();
     const [messageApi, contextHolder] = message.useMessage();
  

   const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
        messageApi.warning("Kullanıcı adı ve şifre gereklidir.");
        return;
    }

    try {
        const users = await fetchUsers();

        const foundUser = users.find(user =>
            user.userName?.trim() === username.trim() &&
            String(user.password)?.trim() === password.trim()
        );

        if (foundUser) {
            setUser({
                userId: foundUser.userId || foundUser.id,
                userName: foundUser.userName
            });
            messageApi.success("Giriş başarılı!");
            navigate("/Home");
        } else {
            messageApi.error("Kullanıcı adı veya şifre yanlış.");
        }
    } catch (error) {
        console.error("Giriş hatası:", error);
        messageApi.error("Giriş sırasında bir hata oluştu.");
    }
};



    

    return (
        <div className='body'>
            <div className='login-container'>
                <Avatar style={{ backgroundColor: 'brown' }} size={100} icon={<UserOutlined />} />
                <div className='login-text'>
                    Stok Takip Uygulamasına Hoşgeldiniz.
                </div>
                <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ marginTop: 50, width: 350, height: 45, backgroundColor: 'white' }}
                    size="large"
                    placeholder="Kullanıcı Adı Giriniz"
                />
                <Input.Password
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size='large'
                    style={{ marginTop: 30, width: 350, height: 45 }}
                    placeholder="Şifrenizi Giriniz"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
                <ConfigProvider
          button={{
                        className: styles.linearGradientButton,
                    }}
                >
            {contextHolder}
     <Button
        type="primary"
        size="large"
        style={{ marginLeft: -1, marginTop: 30, width: 160 }}
        onClick={() => {
        handleLogin(); }}
    block >
    Giriş Yap
</Button>
      </ConfigProvider>
            </div>
        </div>
    );
}

export default Login;
