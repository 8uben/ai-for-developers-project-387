import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { createEventType, fetchAdminEventTypes } from "../api/queries";
import { useApiQuery } from "../hooks/useApiQuery";
import { QueryBoundary } from "../components/QueryBoundary";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Владелец: список типов событий и форма создания нового. */
export function AdminEventTypesPage() {
  const { data, loading, error, reload } = useApiQuery(fetchAdminEventTypes);

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | string>(30);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const slugInvalid = id.length > 0 && !SLUG_PATTERN.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugInvalid) return;
    setSubmitting(true);
    setFormError(undefined);

    const result = await createEventType({
      id,
      title,
      description,
      durationMinutes: Number(durationMinutes),
    });

    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    notifications.show({
      color: "green",
      message: `Тип события «${result.data?.title}» создан.`,
    });
    setId("");
    setTitle("");
    setDescription("");
    setDurationMinutes(30);
    reload();
  };

  return (
    <Stack>
      <Title order={2}>Типы событий</Title>

      <Paper withBorder p="lg" radius="md">
        <Title order={4} mb="md">
          Создать тип события
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            {formError && (
              <Alert color="red" title="Не удалось создать">
                {formError}
              </Alert>
            )}
            <TextInput
              label="Идентификатор (slug)"
              description="Только строчные латинские буквы, цифры и дефис. Напр. 30min"
              placeholder="30min"
              required
              value={id}
              error={slugInvalid ? "Некорректный формат slug" : undefined}
              onChange={(e) => setId(e.currentTarget.value)}
            />
            <TextInput
              label="Название"
              placeholder="Короткий звонок"
              required
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <Textarea
              label="Описание"
              placeholder="Опишите, для чего этот тип встречи"
              required
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
            <NumberInput
              label="Длительность, мин"
              min={1}
              required
              value={durationMinutes}
              onChange={setDurationMinutes}
            />
            <Button type="submit" loading={submitting} disabled={slugInvalid}>
              Создать
            </Button>
          </Stack>
        </form>
      </Paper>

      <Divider my="sm" />

      <Title order={4}>Опубликованные типы</Title>
      <QueryBoundary
        loading={loading}
        error={error}
        empty={data?.length === 0}
        emptyText="Типов событий пока нет."
        onRetry={reload}
      >
        <Stack>
          {data?.map((et) => (
            <Card key={et.id} withBorder padding="md" radius="md">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={600}>{et.title}</Text>
                    <Badge variant="outline">{et.id}</Badge>
                  </Group>
                  <Text c="dimmed" size="sm">
                    {et.description}
                  </Text>
                </Stack>
                <Badge variant="light">{et.durationMinutes} мин</Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      </QueryBoundary>
    </Stack>
  );
}
