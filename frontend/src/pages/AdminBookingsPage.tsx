import { ActionIcon, Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { fetchAdminBookings, deleteAdminBooking } from "../api/queries";
import { useApiQuery } from "../hooks/useApiQuery";
import { QueryBoundary } from "../components/QueryBoundary";
import { formatDateTime } from "../lib/datetime";

/** Владелец: список предстоящих встреч всех типов в одном списке по времени. */
export function AdminBookingsPage() {
  const { data, loading, error, reload } = useApiQuery(fetchAdminBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const sorted = useMemo(
    () => (data ? [...data].sort((a, b) => a.start.localeCompare(b.start)) : []),
    [data],
  );

  const handleCancel = async (id: string) => {
    setCancelling(id);
    await deleteAdminBooking(id);
    setCancelling(null);
    reload();
  };

  return (
    <Stack>
      <Title order={2}>Предстоящие встречи</Title>
      <Text c="dimmed">Бронирования всех типов событий, по времени начала.</Text>

      <QueryBoundary
        loading={loading}
        error={error}
        empty={data?.length === 0}
        emptyText="Предстоящих встреч нет."
        onRetry={reload}
      >
        <Stack>
          {sorted.map((b) => (
            <Card key={b.id} withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fw={600}>{formatDateTime(b.start)}</Text>
                  <Text size="sm">
                    {b.guestName} ({b.guestEmail})
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Badge variant="outline">{b.eventTypeId}</Badge>
                  <ActionIcon
                    color="red"
                    variant="light"
                    size="md"
                    loading={cancelling === b.id}
                    onClick={() => handleCancel(b.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </QueryBoundary>
    </Stack>
  );
}
