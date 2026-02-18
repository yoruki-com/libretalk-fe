import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Routes } from "@/constants/routes";

export default function VipScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace(Routes.PROMO_VIP as never);
  }, [router]);

  return null;
}
