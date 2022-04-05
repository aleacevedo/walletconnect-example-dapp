import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import ICPIcon from "../assets/ICPIcon.svg";
import WICPIcon from "../assets/WICPIcon.svg";
import XTCIcon from "../assets/XTCIcon.svg";

interface IIconStyleProps {
  size: number;
}

const IconPaths = {
  ICP: ICPIcon,
  WICP: WICPIcon,
  XTC: XTCIcon,
};

const SIcon = styled.img<IIconStyleProps>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

const Icon = (props: any) => {
  const { name, size } = props;
  const src = IconPaths[name];

  return <SIcon src={src} size={size} onError={(event: any) => {}} />;
};

Icon.propTypes = {
  name: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
};

Icon.defaultProps = {
  name: null,
  color: "",
  size: 20,
};

export default Icon;
