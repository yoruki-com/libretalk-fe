import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function VipScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/promo/vip" as never);
  }, [router]);

  return null;
}
