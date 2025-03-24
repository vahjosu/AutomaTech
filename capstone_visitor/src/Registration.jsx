import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './Registration.css';

function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    position: '',
    address: '',
    purpose: '',
    IDNumber: '',
  });
  const [submittedData, setSubmittedData] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType] = useState(null);
  const [employeeMode, setEmployeeMode] = useState(null);

  const capitalizeWords = (input) => input.replace(/\b\w/g, (char) => char.toUpperCase());

  const sanitizeInput = (field, input) => {
    if (field === 'address') {
      // Allow letters, numbers, spaces, and commas in address
      return input.replace(/[^a-zA-Z0-9\s,]/g, ''); // Allow letters, numbers, spaces, and commas
    }
    if (['firstName', 'middleName', 'lastName'].includes(field)) {
      // For name fields, allow only letters and spaces, capitalize first letters
      return input.replace(/[^a-zA-Z\s]/g, '');
    }
    if (field === 'IDNumber') {
      // ID number field only allows numbers
      return input.replace(/\D/g, '');
    }
    return input;
  };  

  const validateInput = (field, value) => {
    if (!value) {
      return false;
    }
  
    // Validation rules for Visitor
    if (userType === 'Visitor' && field === 'address' && /[^a-zA-Z0-9\s,]/.test(value)) {
      return false;
    }
  
    if (['firstName', 'middleName', 'lastName'].includes(field) && /[^a-zA-Z\s]/.test(value)) {
      setErrorMessage(`${field} Only letters are allowed.`);
      return false;
    }
  
    // Validation rules for Student
    if (userType === 'Student' && field === 'IDNumber' && /\D/.test(value)) {
      setErrorMessage('ID Number must contain only numbers.');
      return false;
    }
  
    // If no validation errors
    setErrorMessage('');
    return true;
  };  

  const handleInputChange = (field, value) => {
    if (userType === 'Visitor') {
      // Handle name fields (firstName, middleName, lastName) for Visitor
      if (['firstName', 'middleName', 'lastName'].includes(field)) {
        const sanitizedValue = sanitizeInput(field, value);
        const capitalizedValue = capitalizeWords(sanitizedValue);
    
        // Check for invalid characters (only letters and spaces allowed)
        if (/[^a-zA-Z\s]/.test(value)) {
          setErrorMessage(`Only letters are allowed.`);
          return; // Stop processing if invalid characters are detected
        }
    
        setErrorMessage(''); // Clear error message if input is valid
        setFormData((prev) => ({
          ...prev,
          [field]: capitalizedValue, // Update state with capitalized value
        }));
      }
    }
    if (userType === 'Employee') {
      // Handle name fields (firstName, middleName, lastName) for Employee
      if (['firstName', 'middleName', 'lastName'].includes(field)) {
        const sanitizedValue = sanitizeInput(field, value);
  
        // Check for invalid characters (only letters are allowed)
        if (/[^a-zA-Z\s]/.test(value)) {
          setErrorMessage(`Only letters are allowed.`);
          return;
        }
  
        setErrorMessage(''); // Clear error message if input is valid
        setFormData((prev) => ({
          ...prev,
          [field]: sanitizedValue, // Update state with sanitized value
        }));
      }
    }
  
    // Handle IDNumber for all user types (only numbers allowed)
    if (field === 'IDNumber') {
      const numericValue = value.replace(/\D/g, '');
      if (value !== numericValue) {
        setErrorMessage('ID Number must contain only numbers.');
        return;
      }
      setErrorMessage(''); // Clear error message if input is valid
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue, // Update state with sanitized numeric value
      }));
    } else {
      // For other fields (firstName, lastName, etc.), sanitize and capitalize input
      const sanitizedValue = sanitizeInput(field, value);
      const capitalizedValue = capitalizeWords(sanitizedValue);
  
      const isValid = validateInput(field, sanitizedValue); // Validate input based on field
  
      if (isValid) {
        setErrorMessage(''); // Clear error message if the input is valid
        setFormData((prev) => ({
          ...prev,
          [field]: capitalizedValue, // Update state with capitalized value
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: sanitizedValue, // Allow for deletion and other changes if validation fails
        }));
      }
    }
  };  

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      position: '',
      address: '',
      purpose: '',
      IDNumber: '',
    });
    setErrorMessage('');
  };

  const generateRandomID = () => Math.floor(1000000 + Math.random() * 9000000);

 const handleFormSubmit = async (event) => {
  event.preventDefault();
  const { firstName, middleName, lastName, address, purpose, position, IDNumber } = formData;

  // Handle New Employee form submission
  if (userType === 'Employee' && employeeMode === 'NEW') {
    if (!firstName || !lastName || !position) {
      setErrorMessage('Please fill out all required fields: First Name, Last Name, and Position.');
      return;
    }
    const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : ' ';
    setSubmittedData(`${firstName} ${middleInitial} ${lastName} - ${position}`);
    setShowQRCode(true);
    setCountdown(30);
    resetForm();
    setUserType(null); 
    setEmployeeMode(null);
  }
    
    // Visitor validation
    if (userType === 'Visitor') {
      if (!firstName || !lastName || !address || !purpose) {
        setErrorMessage('Please fill out all required fields.');
        return;
      }
      const visitorData = {
        firstName,
        middleName,
        lastName,
        address,
        purpose,
        IDNumber: generateRandomID(),
      };
  
      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitorData),
        });
        if (!response.ok) throw new Error('Failed to submit data.');
  
        const visitorDataString = `${visitorData.IDNumber} ${visitorData.firstName} ${visitorData.lastName} Visitor`;
        setSubmittedData(visitorDataString);
        setShowQRCode(true);
        setCountdown(30);
        resetForm();
        setUserType(null);
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  
    // Employee validation
    else if (userType === 'Employee') {
      if (!firstName || !lastName) {
        setErrorMessage('Please fill out your first name and last name.');
        return;
      }
      const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : ' '; //changed
      setSubmittedData(`${firstName} ${middleInitial} ${lastName}`);
      setShowQRCode(true);
      setCountdown(30);
      resetForm();
      setUserType(null);
      setEmployeeMode(null);
    }
  
    // Student validation
    else if (userType === 'Student') {
      if (!IDNumber) {
        setErrorMessage('Please enter your ID number.');
        return;
      }
      setSubmittedData(IDNumber);
      setShowQRCode(true);
      setCountdown(30);
      resetForm();
    }
  };  

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setShowQRCode(false);
    }
  }, [countdown]);

  const handleBackClick = () => {
    if (employeeMode) {
      setEmployeeMode(null);
    } else {
      setUserType(null);
    }
    resetForm();
  };

  return (
    <div className="main-container3">
      <div className="top-container1">
        <label className="main-title">REGISTRATION</label>
      </div>
      <div className="mid1-container">
        <span className="mid1-text">
          UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES MONITORING SYSTEM - CDO CAMPUS
        </span>
      </div>
      <div className="bottom-container">
        <div className="left-container">
          {userType && (
            <div className="back-button-container" onClick={handleBackClick}>
              <span className="back-icon">←</span>
            </div>
          )}
          <div className="m-box">
            <div className="m-box-title">REGISTER</div>
            {!userType && (
              <div className="buttons">
                {['Visitor', 'Employee', 'Student'].map((type) => (
                  <button key={type} onClick={() => setUserType(type)} className="user-type">
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            {userType === 'Employee' && !employeeMode && (
              <div className="buttons">
                <button onClick={() => setEmployeeMode('OLD')} className="user-type">
                  EXISTING EMPLOYEE
                </button>
                <button onClick={() => setEmployeeMode('NEW')} className="user-type">
                  NEW EMPLOYEE
                </button>
              </div>
            )}
            {userType && (
              <form className="form" onSubmit={handleFormSubmit}>
                {userType === 'Visitor' && (
                  <>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Middle Name (Optional)"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      required
                    />
                  </>
                )}
                {userType === 'Employee' && employeeMode === 'OLD' && (
                  <>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Middle Name (Optional)"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </>
                )}
                {userType === 'Employee' && employeeMode === 'NEW' && (
                  <>
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Middle Name"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-fields"
                      placeholder="Position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      required
                    />
                  </>
                )}
                {userType === 'Student' && (
                  <input
                    type="text"
                    className="input-fields"
                    placeholder="ID Number"
                    value={formData.IDNumber}
                    onChange={(e) => handleInputChange('IDNumber', e.target.value)}
                    required
                  />
                )}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {(userType === 'Visitor' || (userType === 'Employee' && employeeMode) || userType === 'Student') && (
                  <button type="submit" className="r-submit-button">
                    Submit
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
        <div className="right-container">
          <div className="m-box">
            <div className="m-box-title">QR CODE</div>
            {showQRCode && (
              <>
                <QRCode value={submittedData} size={250} />
                <div className="notice">
                  The QR code will disappear in <span>{countdown}</span> seconds.
                </div>
                <div className="notice2">
                  <p>PLEASE TAKE A PICTURE AND USE IT TO</p>
                  <p>ENTER AND EXIT THE CAMPUS. THANK YOU!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );  
}

export default Registration;