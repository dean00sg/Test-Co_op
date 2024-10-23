import React, { useState } from 'react';
import '../styles/login.css';

const LoginPanel = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-panel">
      <h2>Sign in</h2>
      <p1>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p1>

      <div className="input-group">
        <input type="text" placeholder="User Name" />
      </div>

      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
        />
        <button
          type="button"
          className="show-password"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>

      <div className="options">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="forgot-password">Forgot Password?</a>
      </div>

      <button className="btn-primary">Sign in</button>

      <p className="signup">
        Don’t have an account? <a href="#">Sign up</a>
      </p>
    </div>
  );
};

export default LoginPanel;
