import * as React from "react";
import { Alert } from "react-bootstrap";
interface UserAlertProps {
  props: {
    show: boolean;
    setShow: any;
  };
  message: string;
  variant: string;
}
export const UserAlert: React.FC<UserAlertProps> = (props) => {
  return (
    <div className="ErrorContainer">
      <Alert
        dismissible
        onClose={() => props.props.setShow(false)}
        className={props.props.show ? "fadeIn" : "fadeOut"}
        show={props.props.show}
        variant={props.variant}
      >
        {props.message}
      </Alert>
    </div>
  );
  return <></>;
};
