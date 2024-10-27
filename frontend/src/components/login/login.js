import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // นำเข้า useNavigate
import './login.css';

const LoginPanel = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // สร้าง navigate function

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    const loginData = new URLSearchParams();
    loginData.append('username', username);
    loginData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/authentication/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login success:', data);
        // จัดเก็บ token ใน localStorage
        localStorage.setItem('token', data.access_token);
        // เปลี่ยนเส้นทางไปยังหน้า /Home
        navigate('/Home');  
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-panel">
      <h2>Sign in</h2>
     
      <div className="input-group">
        <input
          type="text"
           className="formlogin"
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="formlogin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="show-password"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="options">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="forgot-password">Forgot Password?</a>
      </div>

      <button className="btn-primary" onClick={handleLogin}>Sign in</button>

      <p className="signup">
        Don’t have an account? <a href="#">Sign up</a>
      </p>
    </div>
  );
};

export default LoginPanel;
