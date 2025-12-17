<?php

return [
    'allowed_tables' => array_values(array_filter(array_map(
        fn ($s) => strtolower(trim($s)),
        explode(',', (string) env('AI_DB_ALLOWED_TABLES', '')),
    ))),
    'max_rows' => (int) env('AI_DB_MAX_ROWS', 50),
];

