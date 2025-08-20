import React, { useState } from "react";
import { Modal, Button } from "antd";

const EndExamModal = ({ config, onFinsh }) => {
  const { endExameModal, setEndExamModal } = config;
  // Show modal
  const showModal = () => {
    setEndExamModal(true);
  };

  // Handle modal ok (confirm)
  const handleOk = async () => {
    // Your suspend or end exam action logic here
    console.log("Exam has been ended.");
    onFinsh();
    setEndExamModal(false); // Close the modal after confirming
  };

  // Handle modal cancel (close)
  const handleCancel = () => {
    setEndExamModal(false); // Just close the modal
  };

  return (
    <div>
      {/* Ant Design Modal for suspend confirmation */}
      <Modal
        title="End Exam"
        visible={endExameModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="End Exam"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            backgroundColor: "red", // Urgent red color for "End Exam"
            borderColor: "red", // Ensure border color matches
            color: "white", // Make text white
          },
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: "gray", // Neutral gray for "Cancel"
            borderColor: "gray", // Ensure border color matches
            color: "white", // Make text white
          },
        }}
      >
        <p>
          Are you sure you want to end the exam? This action is irreversible.
        </p>
      </Modal>
    </div>
  );
};

export default EndExamModal;
