import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface QueryBoundaryProps {
  loading: boolean;
  error: string | undefined;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Унифицированная обёртка состояний запроса: loading / error / empty / data.
 */
export function QueryBoundary({
  loading,
  error,
  empty,
  emptyText = "Пока ничего нет.",
  onRetry,
  children,
}: QueryBoundaryProps) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Ошибка">
        <Stack gap="sm">
          <Text>{error}</Text>
          {onRetry && (
            <Button variant="light" color="red" onClick={onRetry} w="fit-content">
              Повторить
            </Button>
          )}
        </Stack>
      </Alert>
    );
  }

  if (empty) {
    return (
      <Center py="xl">
        <Text c="dimmed">{emptyText}</Text>
      </Center>
    );
  }

  return <>{children}</>;
}
