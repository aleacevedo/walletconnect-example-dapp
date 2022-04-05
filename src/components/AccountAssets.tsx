import * as React from "react";
import Column from "./Column";
import AssetRow from "./AssetRow";
import { IAssetData } from "../helpers/types";

const AccountAssets = (props: any) => {
  const { assets } = props;

  return (
    <Column center>
      {assets.map((token) => (
        <AssetRow key={token.symbol} asset={token} />
      ))}
    </Column>
  );
};

export default AccountAssets;
