import React, { useState } from "react";
import { Modal, Button } from "antd";

const TimeOut = ({ config, onFinsh }) => {
  const { timeIsUpModal, setTimeIsUpModal } = config;
  // Show modal
  const showModal = () => {
    setTimeIsUpModal(true);
  };

  // Handle modal ok (confirm)
  const handleOk = async () => {
    // Your suspend or end exam action logic here
    console.log("Exam has been ended.");
    onFinsh();
    setTimeIsUpModal(false); // Close the modal after confirming
  };

  // Handle modal cancel (close)
  const handleCancel = () => {
    setTimeIsUpModal(false); // Just close the modal
  };

  return (
    <div>
      {/* Ant Design Modal for suspend confirmation */}
      <Modal
        title="Warning"
        visible={timeIsUpModal}
        onOk={handleOk}
        // Remove onCancel to hide the cancel button
        okText="Submit"
        okButtonProps={{
          style: {
            backgroundColor: "red", // Urgent red color for "End Exam"
            borderColor: "red", // Ensure border color matches
            color: "white", // Make text white
          },
        }}
        cancelButtonProps={{ style: { display: "none" } }} // Hides the Cancel button
      >
        <p>Your time for the exam has expired</p>
      </Modal>
    </div>
  );
};

export default TimeOut;
