-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql
-- Tiempo de generación: 03-07-2026 a las 14:28:39
-- Versión del servidor: 8.4.9
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ProgramaVuelo`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `nombre`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'T2 Widow', 1, '2026-06-24 15:45:48', '2026-06-24 15:45:51'),
(2, 'T2 Laymuns', 1, '2026-06-26 14:40:31', '2026-06-26 14:40:31'),
(3, 'T2 Iturra', 1, '2026-06-26 14:40:46', '2026-06-26 14:40:46'),
(4, 'T2 Cano', 1, '2026-06-26 14:41:06', '2026-06-26 14:41:06'),
(5, 'T2 Viani', 1, '2026-06-26 14:41:25', '2026-06-26 14:41:25'),
(6, 'T2 Molina', 1, '2026-06-26 14:41:33', '2026-06-26 14:41:33'),
(7, 'T2 Lillo', 1, '2026-06-26 14:41:46', '2026-06-26 14:41:46'),
(8, 'T2 Rodriguez', 1, '2026-06-26 14:42:02', '2026-06-26 14:42:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instructores`
--

CREATE TABLE `instructores` (
  `id` bigint UNSIGNED NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `instructores`
--

INSERT INTO `instructores` (`id`, `nombre`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'T1 Suarez', 1, '2026-06-24 15:21:29', '2026-06-24 15:28:42'),
(2, 'T1 Raby', 1, '2026-06-26 14:19:32', '2026-06-26 14:19:32'),
(3, 'CC Garcia', 1, '2026-06-26 14:44:39', '2026-06-26 14:44:39'),
(4, 'CF Carrasco', 1, '2026-06-26 14:44:51', '2026-06-26 14:44:51'),
(5, 'T1 Bolivar', 1, '2026-06-26 14:45:09', '2026-06-26 14:45:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_06_09_125818_create_vuelos_table', 1),
(5, '2026_06_12_132232_add_observaciones_to_vuelos_table', 1),
(6, '2026_06_15_125407_alter_vuelos_table_split_dotacion', 1),
(7, '2026_06_17_134748_create_novedades_diarias_table', 1),
(8, '2026_06_22_140356_add_estado_progreso_to_vuelos_table', 1),
(9, '2026_06_23_132454_create_instructores_y_alumnos_tables', 1),
(10, '2026_06_23_132457_update_vuelos_table_to_foreign_keys', 1),
(11, '2026_06_26_150229_alterar_columnas_novedades_a_text', 2),
(12, '2026_06_30_154814_add_actividades_to_novedades_diarias', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedades_diarias`
--

CREATE TABLE `novedades_diarias` (
  `id` bigint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `obs_instructores` text COLLATE utf8mb4_unicode_ci,
  `obs_alumnos` text COLLATE utf8mb4_unicode_ci,
  `aeronaves` text COLLATE utf8mb4_unicode_ci,
  `piloto_servicio` text COLLATE utf8mb4_unicode_ci,
  `actividades` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `novedades_diarias`
--

INSERT INTO `novedades_diarias` (`id`, `fecha`, `obs_instructores`, `obs_alumnos`, `aeronaves`, `piloto_servicio`, `actividades`, `created_at`, `updated_at`) VALUES
(1, '2026-06-24', NULL, NULL, '[{\"nombre\":\"NAVAL 211\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 212\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 213\",\"estado\":\"disponible\",\"detalle\":\"84+32\"},{\"nombre\":\"NAVAL 215\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 216\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 217\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 219\",\"estado\":\"baja\",\"detalle\":null}]', NULL, NULL, '2026-06-24 14:57:03', '2026-06-24 14:57:03'),
(2, '2026-06-26', '[{\"id\":3,\"nombre\":\"CC Garcia\",\"observacion\":\"dasaas\"},{\"id\":4,\"nombre\":\"CF Carrasco\",\"observacion\":\"asasasa\"},{\"id\":5,\"nombre\":\"T1 Bolivar\",\"observacion\":\"ferrt4\"},{\"id\":2,\"nombre\":\"T1 Raby\",\"observacion\":\"affefef\"},{\"id\":1,\"nombre\":\"T1 Suarez\",\"observacion\":\"uhdaaaaaaaaaaaaa\"}]', '[{\"id\":4,\"nombre\":\"T2 Cano\",\"observacion\":\"rere\"},{\"id\":3,\"nombre\":\"T2 Iturra\",\"observacion\":\"wddwfg\"},{\"id\":2,\"nombre\":\"T2 Laymuns\",\"observacion\":\"wffwf\"},{\"id\":7,\"nombre\":\"T2 Lillo\",\"observacion\":\"ewedw\"},{\"id\":6,\"nombre\":\"T2 Molina\",\"observacion\":\"wewwd\"},{\"id\":8,\"nombre\":\"T2 Rodriguez\",\"observacion\":\"wfww\"},{\"id\":5,\"nombre\":\"T2 Viani\",\"observacion\":\"wdwtgr\"},{\"id\":1,\"nombre\":\"T2 Widow\",\"observacion\":\"fdffwf\"}]', '[{\"nombre\":\"NAVAL 211\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 212\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 213\",\"estado\":\"disponible\",\"detalle\":\"84+32\"},{\"nombre\":\"NAVAL 215\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 216\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 217\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 219\",\"estado\":\"baja\",\"detalle\":null}]', NULL, NULL, '2026-06-26 13:13:37', '2026-06-26 15:56:04'),
(3, '2026-07-01', '[{\"id\":3,\"nombre\":\"CC Garcia\",\"observacion\":null},{\"id\":4,\"nombre\":\"CF Carrasco\",\"observacion\":null},{\"id\":5,\"nombre\":\"T1 Bolivar\",\"observacion\":null},{\"id\":2,\"nombre\":\"T1 Raby\",\"observacion\":null},{\"id\":1,\"nombre\":\"T1 Suarez\",\"observacion\":null}]', '[{\"id\":4,\"nombre\":\"T2 Cano\",\"observacion\":null},{\"id\":3,\"nombre\":\"T2 Iturra\",\"observacion\":null},{\"id\":2,\"nombre\":\"T2 Laymuns\",\"observacion\":null},{\"id\":7,\"nombre\":\"T2 Lillo\",\"observacion\":null},{\"id\":6,\"nombre\":\"T2 Molina\",\"observacion\":null},{\"id\":8,\"nombre\":\"T2 Rodriguez\",\"observacion\":null},{\"id\":5,\"nombre\":\"T2 Viani\",\"observacion\":null},{\"id\":1,\"nombre\":\"T2 Widow\",\"observacion\":null}]', '[{\"nombre\":\"NAVAL 211\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 212\",\"estado\":\"disponible\",\"detalle\":\"1\"},{\"nombre\":\"NAVAL 213\",\"estado\":\"disponible\",\"detalle\":\"84+32\"},{\"nombre\":\"NAVAL 215\",\"estado\":\"disponible\",\"detalle\":\"44\"},{\"nombre\":\"NAVAL 216\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 217\",\"estado\":\"disponible\",\"detalle\":\"22+66\"},{\"nombre\":\"NAVAL 219\",\"estado\":\"disponible\",\"detalle\":\"24+99\"}]', NULL, NULL, '2026-07-01 13:07:15', '2026-07-01 13:07:52'),
(4, '2026-07-02', '[{\"id\":3,\"nombre\":\"CC Garcia\",\"observacion\":\"aaaaaaaa\"},{\"id\":4,\"nombre\":\"CF Carrasco\",\"observacion\":\"rgWEGewgRG\"},{\"id\":5,\"nombre\":\"T1 Bolivar\",\"observacion\":\"RGRDGDHT\"},{\"id\":2,\"nombre\":\"T1 Raby\",\"observacion\":\"ergraaerfew\"},{\"id\":1,\"nombre\":\"T1 Suarez\",\"observacion\":\"earqwerwafefeffffffffffffffefaweegggggggggggggggggggggggEDEEEEEEEEEEEEEEEEEEEEEEEEEEEE\"}]', '[{\"id\":4,\"nombre\":\"T2 Cano\",\"observacion\":\"SRGSERGERGR\"},{\"id\":3,\"nombre\":\"T2 Iturra\",\"observacion\":\"EREGAERGGERGRG\"},{\"id\":2,\"nombre\":\"T2 Laymuns\",\"observacion\":\"RGERGERGWERG\"},{\"id\":7,\"nombre\":\"T2 Lillo\",\"observacion\":\"ERGRWERGRGW\"},{\"id\":6,\"nombre\":\"T2 Molina\",\"observacion\":\"WERGWERRGQRGQ\"},{\"id\":8,\"nombre\":\"T2 Rodriguez\",\"observacion\":\"GQERRGQREGQEG\"},{\"id\":5,\"nombre\":\"T2 Viani\",\"observacion\":\"ERGERGREQGQERG\"},{\"id\":1,\"nombre\":\"T2 Widow\",\"observacion\":\"ERGEREGQRG\"}]', '[{\"nombre\":\"NAVAL 211\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 212\",\"estado\":\"disponible\",\"detalle\":\"1\"},{\"nombre\":\"NAVAL 213\",\"estado\":\"disponible\",\"detalle\":\"84+32\"},{\"nombre\":\"NAVAL 215\",\"estado\":\"disponible\",\"detalle\":\"44\"},{\"nombre\":\"NAVAL 216\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 217\",\"estado\":\"disponible\",\"detalle\":\"22+66\"},{\"nombre\":\"NAVAL 219\",\"estado\":\"disponible\",\"detalle\":\"24+99\"}]', NULL, NULL, '2026-07-02 12:35:45', '2026-07-02 12:47:29'),
(5, '2026-07-03', '[{\"id\":3,\"nombre\":\"CC Garcia\",\"observacion\":null},{\"id\":4,\"nombre\":\"CF Carrasco\",\"observacion\":null},{\"id\":5,\"nombre\":\"T1 Bolivar\",\"observacion\":null},{\"id\":2,\"nombre\":\"T1 Raby\",\"observacion\":null},{\"id\":1,\"nombre\":\"T1 Suarez\",\"observacion\":null}]', '[{\"id\":4,\"nombre\":\"T2 Cano\",\"observacion\":null},{\"id\":3,\"nombre\":\"T2 Iturra\",\"observacion\":null},{\"id\":2,\"nombre\":\"T2 Laymuns\",\"observacion\":null},{\"id\":7,\"nombre\":\"T2 Lillo\",\"observacion\":null},{\"id\":6,\"nombre\":\"T2 Molina\",\"observacion\":null},{\"id\":8,\"nombre\":\"T2 Rodriguez\",\"observacion\":null},{\"id\":5,\"nombre\":\"T2 Viani\",\"observacion\":null},{\"id\":1,\"nombre\":\"T2 Widow\",\"observacion\":null}]', '[{\"nombre\":\"NAVAL 211\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 212\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 213\",\"estado\":\"disponible\",\"detalle\":\"84+32\"},{\"nombre\":\"NAVAL 215\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 216\",\"estado\":\"baja\",\"detalle\":null},{\"nombre\":\"NAVAL 217\",\"estado\":\"disponible\",\"detalle\":\"22+66\"},{\"nombre\":\"NAVAL 219\",\"estado\":\"disponible\",\"detalle\":\"24+99\"}]', NULL, NULL, '2026-07-03 14:23:47', '2026-07-03 14:23:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('46fePpGprNtl6Fy9XLlg2mELUfRUcaVIWlG34Uuj', 1, '172.19.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0', 'eyJfdG9rZW4iOiJ2R2dlUkdKSktuQXZBeUFqNmtaell5b0haOUg0OGE2U0piTkpyTjFlIiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BpemFycmEiLCJyb3V0ZSI6InBpemFycmEuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1783088663),
('pQmRmhlz9QI7ULAUP7TlrgLg73ataIjX8YNHUCDP', 1, '172.19.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0', 'eyJfdG9rZW4iOiJ0VWV4VXZSNkNWcUV5U0hyS1V5ZjRxcVhDZnY1Tk9oZFp4MmtGT210IiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BpemFycmEiLCJyb3V0ZSI6InBpemFycmEuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1782831552),
('qeVUnUZmhR6QtD6mRXhEqBzBkagaWT0HVMGfFyud', 1, '172.19.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0', 'eyJfdG9rZW4iOiJmclhWS1hFOXprSTBCM250UU5WVjV6OHd6RUM2eUlNY2NqbktQZ2hiIiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BpemFycmEiLCJyb3V0ZSI6InBpemFycmEuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1783001774),
('uhrViwRHOXgWXC22bHdiJa1KOYEebwv1euulK1t9', 1, '172.19.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0', 'eyJfdG9rZW4iOiJyNkZHOFppeFpSekRKNHZ4Y0JINEZGNnFFMm1NeTBHa1ljaWJQNjl6IiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BpemFycmEiLCJyb3V0ZSI6InBpemFycmEuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1782919512);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Luciano', 'lucianograssosadi05@gmail.com', NULL, '$2y$12$spixKBe.z.amp50rL8nLauReCru15yxLwTKgtp7ZlowVitDZWqCz.', 'sgwzQL9DE2Wxqo8cizclwzSrlInv8AUzQmVn0CBmStYJaPnYbLCYaMSApmSl', '2026-06-23 14:56:02', '2026-06-23 14:56:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vuelos`
--

CREATE TABLE `vuelos` (
  `id` bigint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `aeronave` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etd` time NOT NULL,
  `eta` time NOT NULL,
  `mision` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructor_id` bigint UNSIGNED NOT NULL,
  `alumno_id` bigint UNSIGNED NOT NULL,
  `nota` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_progreso` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'programado',
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `vuelos`
--

INSERT INTO `vuelos` (`id`, `fecha`, `aeronave`, `etd`, `eta`, `mision`, `instructor_id`, `alumno_id`, `nota`, `estado_progreso`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, '2026-06-25', 'NAVAL 213', '08:53:00', '10:50:00', 'PS-3D', 1, 1, 'R-17', 'programado', NULL, '2026-06-25 12:50:39', '2026-06-25 12:50:39'),
(2, '2026-06-26', 'NAVAL 213', '10:57:00', '12:58:00', 'PS-4D', 1, 1, 'R-35', 'programado', NULL, '2026-06-25 14:56:48', '2026-06-25 14:56:57'),
(3, '2026-06-25', 'NAVAL 213', '10:30:00', '11:00:00', 'PS-3D', 1, 1, 'R-1', 'programado', NULL, '2026-06-25 15:02:35', '2026-06-25 15:02:35'),
(4, '2026-07-01', 'NAVAL 213', '09:58:00', '12:58:00', 'PS-4D', 3, 6, 'R-1', 'programado', NULL, '2026-06-30 13:57:12', '2026-06-30 13:57:35');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indices de la tabla `instructores`
--
ALTER TABLE `instructores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `novedades_diarias`
--
ALTER TABLE `novedades_diarias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `novedades_diarias_fecha_unique` (`fecha`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `vuelos`
--
ALTER TABLE `vuelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vuelos_instructor_id_foreign` (`instructor_id`),
  ADD KEY `vuelos_alumno_id_foreign` (`alumno_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instructores`
--
ALTER TABLE `instructores`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `novedades_diarias`
--
ALTER TABLE `novedades_diarias`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `vuelos`
--
ALTER TABLE `vuelos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `vuelos`
--
ALTER TABLE `vuelos`
  ADD CONSTRAINT `vuelos_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `vuelos_instructor_id_foreign` FOREIGN KEY (`instructor_id`) REFERENCES `instructores` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
