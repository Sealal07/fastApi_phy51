import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [ships, setShips] = useState([]);
  const [formData, setFormData] = useState({
    name: '', speed: 1000, destination: 'Mars', fuel_level: 100
  });
  const fetchShips = async () => {
    const response =  await axios.get('http://127.0.0.1:8000/ships');
    setShips(response.data.ships);
  };
  useEffect(()=>{ fetchShips(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('http://127.0.0.1:8000/ships/register', formData);
    fetchShips();
  };
  return (
    <>
     <h1>Space control panel</h1>
     <form onSubmit={handleSubmit}>
        <input placeholder='Название' onChange={event=>setFormData({...formData,
        name: event.target.value})} />
        <input placeholder='Скорость' onChange={event=>setFormData({...formData,
        speed: event.target.value})} />
        <input placeholder='Цель' onChange={event=>setFormData({...formData,
        destination: event.target.value})} />
        <button type='submit'>Зарегистрировать</button>
     </form>
     <h2>Зарегистированные корабли:</h2>
     <ul>
      {ships.cdmap((ship, index) => (
        <li key={index}>
          <b>{ship.name}</b> - летит на {ship.destination}.
          Прибытие через: {ship.estimated_arrival_hours} ч.
        </li>
      ))}
     </ul>
    </>
  );
}

export default App;
