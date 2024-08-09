import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach(key => form.append(`user[${key}]`, formData[key]));

    fetch('https://backend-aid-b83f0dba9cf5.herokuapp.com/signup', {
      method: 'POST',
      body: form,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('User created', data);
      })
      .catch(error => {
        console.error('There was an error creating the user!', error);
      });
  };

  return (
    <div className="container mt-5">
      <div className="card bg-light">
        <div className="card-header text-center">
          <h2>Sign-up</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="first_name">First Name:</label>
              <input
                type="text"
                className="form-control"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name:</label>
              <input
                type="text"
                className="form-control"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password_confirmation">Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="photo">Photo ID:</label>
              <input
                type="file"
                className="form-control-file"
                id="photo"
                name="photo"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center mt-3">
              <button type="submit" className="btn btn-primary">Complete Registration</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
