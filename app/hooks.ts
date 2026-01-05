import type { LoaderFunction, ActionFunction } from "react-router";
import { useLoaderData, useActionData } from "react-router";

export function useTypedLoaderData<T extends LoaderFunction>() {
  return useLoaderData() as unknown as Awaited<ReturnType<T>>;
}

export function useTypedActionData<T extends ActionFunction>() {
  return useActionData() as unknown as Awaited<ReturnType<T>> | undefined;
}
