import React from "react";
import { Modal, Input, Button } from "antd";

const ModalCompo = ({ state, handleClose, type, heading, handelSubmit }) => {
  return (
    <Modal
      visible={state}
      onCancel={() => handleClose(type)}
      footer={[
        <Button key="close" onClick={() => handleClose(type)} type="default">
          Close
        </Button>,
        <Button key="submit" onClick={() => handelSubmit(type)}>
          Submit
        </Button>,
      ]}
      width={600} // You can adjust the width as needed
      style={{ padding: "20px" }} // Optional padding for the modal content
    >
      <h3 className="mb-4">{heading}</h3>
      <Input.TextArea
        placeholder="Your Note"
        rows={10}
        // onChange={handleNoteChange}
        // value={note} // Ensure this is bound to the state
      />
    </Modal>
  );
};

export default ModalCompo;
