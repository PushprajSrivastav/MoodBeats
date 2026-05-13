import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'

const Protected = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if(loading) return <div>Loading...</div>;
  if(!user){
    navigate("/login");
  }

  return children;
}

export default Protected