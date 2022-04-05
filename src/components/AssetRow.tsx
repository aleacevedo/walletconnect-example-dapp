import * as React from "react";
import styled from "styled-components";
import Icon from "./Icon";

const SAssetRow = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;
const SAssetRowLeft = styled.div`
  display: flex;
`;
const SAssetName = styled.div`
  display: flex;
  margin-left: 10px;
`;
const SAssetRowRight = styled.div`
  display: flex;
`;
const SAssetBalance = styled.div`
  display: flex;
`;

const AssetRow = (props: any) => {
  const { asset } = props;

  return (
    <SAssetRow {...props}>
      <SAssetRowLeft>
        <Icon name={asset.symbol} />
        <SAssetName>{asset.name}</SAssetName>
      </SAssetRowLeft>
      <SAssetRowRight>
        <SAssetBalance>{`${asset.amount} ${asset.symbol}`}</SAssetBalance>
      </SAssetRowRight>
    </SAssetRow>
  );
};

export default AssetRow;
