import { Box, Button, List, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconClock, IconCalendar } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <Box
      style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #fed7aa 100%)",
        minHeight: "calc(100vh - 60px)",
        margin: "-16px",
        padding: "48px 16px",
      }}
    >
      <Stack align="center" py="xl">
        <Title order={1} c="orange" fz={48}>
          Calendar
        </Title>

        <Text size="sm" c="orange" fw={700} tt="uppercase" lts={2}>
          Быстрая запись на звонок
        </Text>

        <Title order={2} ta="center" mt="xs">
          Простой способ забронировать время для встречи
        </Title>
        <Text c="dimmed" ta="center" maw={480}>
          Выберите тип события, найдите свободный слот и запишитесь за пару кликов —
          без регистрации и лишних шагов.
        </Text>

        <Button
          component={Link}
          to="/book"
          size="lg"
          color="orange"
          mt="md"
        >
          Записаться →
        </Button>

        <Paper withBorder p="xl" radius="md" mt="xl" maw={520} w="100%" bg="white">
          <Title order={4} mb="md">
            Возможности
          </Title>
          <List spacing="sm">
            <List.Item icon={<IconCheck size={18} color="var(--mantine-color-orange-6)" />}>
              <Text>Выбирайте тип события с подходящей длительностью</Text>
            </List.Item>
            <List.Item icon={<IconClock size={18} color="var(--mantine-color-orange-6)" />}>
              <Text>Бронируйте свободное время на ближайшие 14 дней</Text>
            </List.Item>
            <List.Item icon={<IconCalendar size={18} color="var(--mantine-color-orange-6)" />}>
              <Text>Без регистрации — достаточно имени и email</Text>
            </List.Item>
          </List>
        </Paper>
      </Stack>
    </Box>
  );
}