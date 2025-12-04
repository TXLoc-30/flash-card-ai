/**
 * Displays the update display name page.
 */

import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { db } from '../../firebase/firebaseIndex';
import { firebaseAuth } from '../../provider/AuthProvider';

import Breadcrumb from '../Breadcrumb';
import PageHeading from '../PageHeading';
import TextInput from '../TextInput';
import useAuth from '../../hooks/useAuth';

const UpdateDisplayName = () => {
  const [inputs, setInputs] = useState({ displayName: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useContext(firebaseAuth);
  const { status, error, handleChangeDisplayName } = useAuth(null, null, null, inputs.displayName);

  // Load current displayName
  useEffect(() => {
    if (!user) return;
    
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          setInputs({ displayName: userData.displayName || "" });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user data: ", err);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (error === null) {
      setErrorMessage("");
      return;
    }

    switch (error.code) {
      case null:
        setErrorMessage("");
        return;
      case "empty-name":
        setErrorMessage("Tên không được để trống.");
        return;
      default:
        setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
        return;
    }
  }, [error]);

  const handleChange = e => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  }

  if (loading) {
    return (
      <>
        <Breadcrumb 
          to="/my-account"
          name="My account"
        />
        <PageHeading
          title="Đang tải..."
          subtitle=""
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumb 
        to="/my-account"
        name="My account"
      />
      <PageHeading
        title="Cập nhật tên."
        subtitle="Nhập tên mới của bạn."
      />
      <form onSubmit={(event) => {
        event.preventDefault();
        handleChangeDisplayName();
      }}>
        <TextInput 
          labelText="Tên của bạn"
          icon={<FontAwesomeIcon icon={faUser} />}
          id="displayName"
          name="displayName"
          value={inputs.displayName}
          onChange={handleChange}
          placeholder="Nhập tên của bạn"
        />
        {errorMessage !== "" && <p className="error">{errorMessage}</p>}
        <button className="btn btn-primary">
          {status === "loading" ? "Đang tải . . . " : status === "success" ? "Thành công!" : "Cập nhật tên"}
        </button>
      </form>
    </>
  );
}

export default UpdateDisplayName;

