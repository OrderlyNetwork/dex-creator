import { useSearchParams } from "@remix-run/react";
import { useQuery } from "../net";

type DistributorInfo = {
  distributor_code?: string;
  distributor_broker_id?: string;
  distributor_broker_name?: string;
};

export const useDistrubutorCode = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get("distributor_code");
};

export const useDistrubutorInfo = () => {
  const distributor_code = useDistrubutorCode();

  const { data } = useQuery<DistributorInfo>(
    distributor_code
      ? `/v1/orderly_one/vanguard/verify_code?distributor_code=${distributor_code}`
      : null
  );

  return {
    distributor_code,
    ...data,
  };
};

