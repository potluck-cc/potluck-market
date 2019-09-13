import React, { memo } from "react";
import Modal from "react-native-modalbox";

type DropdownProps = {
  data: { [key: string]: any }[];
};

export default memo(function Dropdown({ data }: DropdownProps) {
  return <Modal />;
});
