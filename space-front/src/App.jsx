import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [ships, setShips] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');

  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [shipData, setShipData] = useState({
    name: '', speed: 1000, destination: 'Mars', fuel_level: 100
  });

  const API_URL = 'http://127.0.0.1:8000';

  const fetchShips = async () => {
    try {
      const response = await axios.get(`${API_URL}/ships`);
      setShips(response.data.ships);
    } catch (error) {
      console.error("Ошибка при загрузке кораблей", error);
    }
  };

  useEffect(() => { fetchShips(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register_user`, authData);
      alert("Пользователь создан! Теперь войдите.");
    } catch (error) {
      alert("Ошибка регистрации: " + error.response.data.detail);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', authData.username);
      formData.append('password', authData.password);

      const response = await axios.post(`${API_URL}/token`, formData);
      const newToken = response.data.access_token;

      setToken(newToken);
      localStorage.setItem('token', newToken);
      alert("Вы успешно вошли!");
    } catch (error) {
      alert("Ошибка входа: " + error.response.data.detail);
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/ships/register`, shipData, {
        headers: { Authorization: `Bearer ${token}` } // Передаем токен
      });
      fetchShips();
      alert("Корабль зарегистрирован!");
    } catch (error) {
      alert("Ошибка: " + (error.response?.status === 401 ? "Нужно авторизоваться" : error.response?.data.detail));
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Space Control Panel</h1>


      {!token ? (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>Вход / Регистрация</h3>
          <input
            placeholder='Логин'
            onChange={e => setAuthData({...authData, username: e.target.value})}
          />
          <input
            type="password"
            placeholder='Пароль'
            onChange={e => setAuthData({...authData, password: e.target.value})}
          />
          <button onClick={handleLogin}>Войти</button>
          <button onClick={handleRegister}>Зарегистрироваться</button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <span>Вы авторизованы </span>
          <button onClick={logout}>Выйти</button>
        </div>
      )}

      <hr />

      <h2>Зарегистрировать новый корабль</h2>
      <form onSubmit={handleShipSubmit}>
        <input placeholder='Название' onChange={e => setShipData({...shipData, name: e.target.value})} />
        <input type="number" placeholder='Скорость' onChange={e => setShipData({...shipData, speed: e.target.value})} />
        <input placeholder='Цель' onChange={e => setShipData({...shipData, destination: e.target.value})} />
        <button type='submit' disabled={!token}>Отправить в полет</button>
        {!token && <p style={{color: 'red'}}>Нужна авторизация, чтобы добавить корабль</p>}
      </form>

      <hr />

      <h2>Зарегистрированные корабли:</h2>
      <ul>
        {ships.map((ship, index) => (
          <li key={index}>
            <b>{ship.name}</b> — летит на {ship.destination}.
            Прибытие через: <i>{ship.estimated_arrival_hours} ч.</i>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;