import React, { useState } from "react";
import { Modal, Button } from "antd";

const SuspendPopup = ({ config }) => {
  const { suspendModal, setSuspentModal } = config;

  // Show modal
  const showModal = () => {
    setSuspentModal(true);
  };

  // Handle modal ok (confirm)
  const handleOk = () => {
    setSuspentModal(false); // Close the modal after confirming
  };

  // Handle modal cancel (close)
  const handleCancel = () => {
    setSuspentModal(false); // Just close the modal
  };

  return (
    <div>
      {/* Ant Design Modal for suspend confirmation */}
      <Modal
        title="Suspend Exam"
        visible={suspendModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Suspend"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            backgroundColor: "red", // Change the color of the "Suspend" button
            borderColor: "red", // Ensure the border color matches
          },
        }}
      >
        <p>Are you sure you want to suspend this user?</p>
      </Modal>
    </div>
  );
};

export default SuspendPopup;
