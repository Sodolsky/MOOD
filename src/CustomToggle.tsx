import { useAccordionButton } from "react-bootstrap";
import "./Styles/CustomToggle.scss";
export const CustomToggle: React.FC<{ eventKey: string }> = ({
  children,
  eventKey,
}) => {
  const openAccordion = useAccordionButton(eventKey);
  return (
    <button onClick={openAccordion} className="CustomToggle">
      {children}
    </button>
  );
};
