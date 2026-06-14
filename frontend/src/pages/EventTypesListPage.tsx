import { Badge, Card, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { fetchPublicEventTypes } from "../api/queries";
import type { EventType } from "../api/client";
import { useApiQuery } from "../hooks/useApiQuery";
import { QueryBoundary } from "../components/QueryBoundary";
import { OwnerCard } from "../components/OwnerCard";

function EventTypeCard({ et }: { et: EventType }) {
  const navigate = useNavigate();

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/book/${et.id}`)}
    >
      <Stack gap="xs">
        <Badge variant="light" color="orange" w="fit-content">
          {et.durationMinutes} мин
        </Badge>
        <Title order={4}>{et.title}</Title>
        <Text c="dimmed" size="sm">
          {et.description}
        </Text>
      </Stack>
    </Card>
  );
}

/** Гость: каталог типов событий (маршрут /book). */
export function EventTypesListPage() {
  const { data, loading, error, reload } = useApiQuery(fetchPublicEventTypes);

  return (
    <Container size="md">
      <Stack>
      <Card withBorder padding="lg" radius="md">
        <Stack gap="xs">
          <OwnerCard compact />
          <Title order={3} mt="sm">
            Выберите тип события
          </Title>
          <Text c="dimmed" size="sm">
            Нажмите на карточку, чтобы увидеть свободные слоты.
          </Text>
        </Stack>
      </Card>

      <QueryBoundary
        loading={loading}
        error={error}
        empty={data?.length === 0}
        emptyText="Владелец ещё не опубликовал ни одного типа события."
        onRetry={reload}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {data?.map((et) => (
            <EventTypeCard key={et.id} et={et} />
          ))}
        </SimpleGrid>
      </QueryBoundary>
    </Stack>
    </Container>
  );
}