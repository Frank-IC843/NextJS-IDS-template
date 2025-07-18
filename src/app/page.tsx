import { getClient } from "@/lib/apollo-client";
import { BUSINESS_LAYOUT_QUERY } from "./queries";
import { Buttons } from "@/app/components/buttons";

export default async function Home() {
  const { data } = await getClient().query({ query: BUSINESS_LAYOUT_QUERY });
  console.log(data);

  return (
    <div css={{ display: "flex", flexDirection: "column" }}>
      <Buttons />
    </div>
  );
}
