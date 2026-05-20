import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  // ऐप खुलते ही यह यूजर को सीधे सुरक्षा घेरे (Login Screen) के अंदर भेज देगा
  return <Redirect href="/login" />;
}
