import React from 'react';
import CreateThreadForm from '../components/threads/new/CreateThreadForm';
import Footer from '../components/threads/new/CreateFooter';
const CreatePage = () => {
  return (
    <div className="create-page">
      <CreateThreadForm />
      <Footer />
    </div>
  );
};

export default CreatePage;