--
-- PostgreSQL database dump
--

\restrict 8F148HzhKplT7NtSP4m3ew2PYCTYSh4Za7rZAfPyqCpI65VYIQO1oPpALLyWo6f

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-17 15:47:27 MST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE rinku_db;
--
-- TOC entry 3808 (class 1262 OID 31525)
-- Name: rinku_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE rinku_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE rinku_db OWNER TO postgres;

\unrestrict 8F148HzhKplT7NtSP4m3ew2PYCTYSh4Za7rZAfPyqCpI65VYIQO1oPpALLyWo6f
\connect rinku_db
\restrict 8F148HzhKplT7NtSP4m3ew2PYCTYSh4Za7rZAfPyqCpI65VYIQO1oPpALLyWo6f

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 857 (class 1247 OID 31527)
-- Name: rol; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol AS ENUM (
    'CHOFER',
    'CARGADOR',
    'AUXILIAR'
);


ALTER TYPE public.rol OWNER TO postgres;

--
-- TOC entry 863 (class 1247 OID 31540)
-- Name: rol_cubierto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_cubierto AS ENUM (
    'CHOFER',
    'CARGADOR'
);


ALTER TYPE public.rol_cubierto OWNER TO postgres;

--
-- TOC entry 860 (class 1247 OID 31534)
-- Name: tipo_contrato; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_contrato AS ENUM (
    'INTERNO',
    'EXTERNO'
);


ALTER TYPE public.tipo_contrato OWNER TO postgres;

--
-- TOC entry 228 (class 1255 OID 31641)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END; $$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- TOC entry 227 (class 1255 OID 31638)
-- Name: trg_validar_cobertura(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trg_validar_cobertura() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE v_rol rol;
BEGIN
  IF NEW.cubrio_turno THEN
    SELECT rol INTO v_rol FROM empleados WHERE id = NEW.empleado_id;
    IF v_rol <> 'AUXILIAR' THEN
      RAISE EXCEPTION 'Solo un AUXILIAR puede registrar cobertura de rol';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_validar_cobertura() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 31546)
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    numero character varying(20) NOT NULL,
    nombre text NOT NULL,
    rol public.rol NOT NULL,
    tipo public.tipo_contrato NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 31545)
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleados_id_seq OWNER TO postgres;

--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 217
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- TOC entry 220 (class 1259 OID 31561)
-- Name: movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos (
    id integer NOT NULL,
    empleado_id integer NOT NULL,
    fecha date NOT NULL,
    entregas integer NOT NULL,
    cubrio_turno boolean DEFAULT false NOT NULL,
    rol_cubierto public.rol_cubierto,
    horas integer DEFAULT 8 NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_mov_horas CHECK (((horas > 0) AND (horas <= 12))),
    CONSTRAINT chk_mov_rol_cubierto CHECK ((((cubrio_turno = true) AND (rol_cubierto IS NOT NULL)) OR ((cubrio_turno = false) AND (rol_cubierto IS NULL)))),
    CONSTRAINT movimientos_entregas_check CHECK ((entregas >= 0))
);


ALTER TABLE public.movimientos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 31560)
-- Name: movimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_id_seq OWNER TO postgres;

--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 219
-- Name: movimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_id_seq OWNED BY public.movimientos.id;


--
-- TOC entry 226 (class 1259 OID 31617)
-- Name: nomina_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomina_detalles (
    id integer NOT NULL,
    nomina_id integer NOT NULL,
    empleado_id integer NOT NULL,
    dias_trabajados integer NOT NULL,
    horas_totales integer NOT NULL,
    entregas_totales integer NOT NULL,
    base numeric(12,2) NOT NULL,
    bono numeric(12,2) NOT NULL,
    pago_entregas numeric(12,2) NOT NULL,
    bruto numeric(12,2) NOT NULL,
    vales numeric(12,2) NOT NULL,
    isr numeric(12,2) NOT NULL,
    neto numeric(12,2) NOT NULL
);


ALTER TABLE public.nomina_detalles OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 31616)
-- Name: nomina_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nomina_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nomina_detalles_id_seq OWNER TO postgres;

--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 225
-- Name: nomina_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nomina_detalles_id_seq OWNED BY public.nomina_detalles.id;


--
-- TOC entry 224 (class 1259 OID 31602)
-- Name: nominas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nominas (
    id integer NOT NULL,
    periodo character(7) NOT NULL,
    generado_en timestamp without time zone DEFAULT now() NOT NULL,
    parametros_id integer NOT NULL,
    estado character varying(20) DEFAULT 'BORRADOR'::character varying NOT NULL
);


ALTER TABLE public.nominas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 31601)
-- Name: nominas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nominas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nominas_id_seq OWNER TO postgres;

--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 223
-- Name: nominas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nominas_id_seq OWNED BY public.nominas.id;


--
-- TOC entry 222 (class 1259 OID 31583)
-- Name: parametros_nomina; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parametros_nomina (
    id integer NOT NULL,
    vigente_desde date DEFAULT CURRENT_DATE NOT NULL,
    base_por_hora numeric(12,2) DEFAULT 30.00 NOT NULL,
    bono_hora_chofer numeric(12,2) DEFAULT 10.00 NOT NULL,
    bono_hora_cargador numeric(12,2) DEFAULT 5.00 NOT NULL,
    bono_hora_auxiliar numeric(12,2) DEFAULT 0.00 NOT NULL,
    pago_por_entrega numeric(12,2) DEFAULT 5.00 NOT NULL,
    isr_base numeric(5,4) DEFAULT 0.09 NOT NULL,
    isr_extra_umbral_bruto numeric(12,2) DEFAULT 16000.00 NOT NULL,
    isr_extra_adicional numeric(5,4) DEFAULT 0.03 NOT NULL,
    vales_pct numeric(5,4) DEFAULT 0.04 NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.parametros_nomina OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 31582)
-- Name: parametros_nomina_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parametros_nomina_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parametros_nomina_id_seq OWNER TO postgres;

--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 221
-- Name: parametros_nomina_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parametros_nomina_id_seq OWNED BY public.parametros_nomina.id;


--
-- TOC entry 3588 (class 2604 OID 31549)
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 31564)
-- Name: movimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos ALTER COLUMN id SET DEFAULT nextval('public.movimientos_id_seq'::regclass);


--
-- TOC entry 3612 (class 2604 OID 31620)
-- Name: nomina_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina_detalles ALTER COLUMN id SET DEFAULT nextval('public.nomina_detalles_id_seq'::regclass);


--
-- TOC entry 3609 (class 2604 OID 31605)
-- Name: nominas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nominas ALTER COLUMN id SET DEFAULT nextval('public.nominas_id_seq'::regclass);


--
-- TOC entry 3597 (class 2604 OID 31586)
-- Name: parametros_nomina id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametros_nomina ALTER COLUMN id SET DEFAULT nextval('public.parametros_nomina_id_seq'::regclass);


--
-- TOC entry 3794 (class 0 OID 31546)
-- Dependencies: 218
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.empleados VALUES (1, 'C001', 'Carlos Chofer', 'CHOFER', 'INTERNO', true, '2025-09-16 05:25:14.242', '2025-09-16 05:25:14.242');
INSERT INTO public.empleados VALUES (2, 'G001', 'Gustavo Cargador', 'CARGADOR', 'EXTERNO', true, '2025-09-16 05:25:42.294', '2025-09-16 05:25:42.294');
INSERT INTO public.empleados VALUES (3, 'A001', 'Ana Auxiliar', 'AUXILIAR', 'INTERNO', true, '2025-09-16 05:26:18.765', '2025-09-16 05:26:18.765');
INSERT INTO public.empleados VALUES (5, '321', 'dsadsa', 'CHOFER', 'INTERNO', true, '2025-09-16 06:17:51.389', '2025-09-16 06:17:51.389');


--
-- TOC entry 3796 (class 0 OID 31561)
-- Dependencies: 220
-- Data for Name: movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.movimientos VALUES (1, 3, '2025-05-02', 6, false, NULL, 8, '2025-09-16 05:33:20.495', '2025-09-16 05:33:20.495');
INSERT INTO public.movimientos VALUES (5, 2, '2025-05-02', 4, false, NULL, 8, '2025-09-16 05:35:52.897', '2025-09-16 05:35:52.897');
INSERT INTO public.movimientos VALUES (7, 3, '2025-05-03', 5, true, 'CHOFER', 8, '2025-09-16 05:37:14.752', '2025-09-16 05:37:14.752');
INSERT INTO public.movimientos VALUES (8, 3, '2025-05-04', 5, true, 'CARGADOR', 8, '2025-09-16 05:37:40.457', '2025-09-16 05:37:40.457');
INSERT INTO public.movimientos VALUES (9, 5, '2025-09-09', 6, false, NULL, 5, '2025-09-16 06:32:01.116', '2025-09-16 06:32:01.116');
INSERT INTO public.movimientos VALUES (10, 3, '2025-09-16', 0, true, 'CARGADOR', 8, '2025-09-16 07:37:25.342', '2025-09-16 07:37:25.343');
INSERT INTO public.movimientos VALUES (21, 2, '2025-09-16', 7, false, NULL, 8, '2025-09-17 02:35:24.052', '2025-09-17 02:35:24.052');
INSERT INTO public.movimientos VALUES (22, 1, '2025-09-16', 8, false, NULL, 8, '2025-09-17 02:35:37.149', '2025-09-17 02:35:37.149');
INSERT INTO public.movimientos VALUES (23, 3, '2025-09-17', 4, true, 'CHOFER', 8, '2025-09-17 02:35:51.406', '2025-09-17 02:35:51.406');
INSERT INTO public.movimientos VALUES (26, 1, '2025-09-17', 9, false, NULL, 8, '2025-09-17 05:58:31.691', '2025-09-17 05:58:31.691');
INSERT INTO public.movimientos VALUES (27, 2, '2025-09-17', 7, false, NULL, 8, '2025-09-17 06:03:41.748', '2025-09-17 06:03:41.748');
INSERT INTO public.movimientos VALUES (29, 3, '2025-09-18', 0, true, 'CARGADOR', 8, '2025-09-17 06:04:02.217', '2025-09-17 06:04:02.217');
INSERT INTO public.movimientos VALUES (30, 2, '2025-09-18', 6, false, NULL, 8, '2025-09-17 06:41:02.81', '2025-09-17 06:41:02.81');
INSERT INTO public.movimientos VALUES (31, 1, '2025-09-18', 6, false, NULL, 8, '2025-09-17 06:41:11.581', '2025-09-17 06:41:11.581');


--
-- TOC entry 3802 (class 0 OID 31617)
-- Dependencies: 226
-- Data for Name: nomina_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nomina_detalles VALUES (1, 1, 3, 3, 24, 16, 720.00, 120.00, 80.00, 920.00, 36.80, 82.80, 837.20);
INSERT INTO public.nomina_detalles VALUES (2, 1, 2, 1, 8, 4, 240.00, 40.00, 20.00, 300.00, 0.00, 27.00, 273.00);
INSERT INTO public.nomina_detalles VALUES (53, 15, 5, 1, 5, 6, 175.00, 50.00, 36.00, 261.00, 13.05, 23.49, 237.51);
INSERT INTO public.nomina_detalles VALUES (54, 15, 3, 3, 24, 4, 840.00, 176.00, 24.00, 1040.00, 52.00, 93.60, 946.40);
INSERT INTO public.nomina_detalles VALUES (55, 15, 2, 3, 24, 20, 840.00, 144.00, 120.00, 1104.00, 0.00, 99.36, 1004.64);
INSERT INTO public.nomina_detalles VALUES (56, 15, 1, 3, 24, 23, 840.00, 240.00, 138.00, 1218.00, 60.90, 109.62, 1108.38);


--
-- TOC entry 3800 (class 0 OID 31602)
-- Dependencies: 224
-- Data for Name: nominas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nominas VALUES (1, '2025-05', '2025-09-16 05:53:15.554', 1, 'BORRADOR');
INSERT INTO public.nominas VALUES (15, '2025-09', '2025-09-17 06:41:46.081', 4, 'CERRADA');


--
-- TOC entry 3798 (class 0 OID 31583)
-- Dependencies: 222
-- Data for Name: parametros_nomina; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.parametros_nomina VALUES (1, '2025-09-15', 30.00, 10.00, 5.00, 0.00, 5.00, 0.0900, 16000.00, 0.0300, 0.0400, false);
INSERT INTO public.parametros_nomina VALUES (2, '2025-09-16', 35.00, 12.00, 6.00, 0.00, 6.00, 0.0900, 18000.00, 0.0300, 0.0500, false);
INSERT INTO public.parametros_nomina VALUES (3, '2025-09-16', 35.00, 30.00, 6.00, 0.00, 6.00, 0.0900, 18000.00, 0.0300, 0.0500, false);
INSERT INTO public.parametros_nomina VALUES (4, '2025-09-16', 35.00, 10.00, 6.00, 0.00, 6.00, 0.0900, 18000.00, 0.0300, 0.0500, true);


--
-- TOC entry 3814 (class 0 OID 0)
-- Dependencies: 217
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_id_seq', 5, true);


--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 219
-- Name: movimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_id_seq', 32, true);


--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 225
-- Name: nomina_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nomina_detalles_id_seq', 56, true);


--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 223
-- Name: nominas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nominas_id_seq', 15, true);


--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 221
-- Name: parametros_nomina_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parametros_nomina_id_seq', 4, true);


--
-- TOC entry 3617 (class 2606 OID 31558)
-- Name: empleados empleados_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_numero_key UNIQUE (numero);


--
-- TOC entry 3619 (class 2606 OID 31556)
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- TOC entry 3624 (class 2606 OID 31573)
-- Name: movimientos movimientos_empleado_id_fecha_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_empleado_id_fecha_key UNIQUE (empleado_id, fecha);


--
-- TOC entry 3626 (class 2606 OID 31571)
-- Name: movimientos movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 31624)
-- Name: nomina_detalles nomina_detalles_nomina_id_empleado_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina_detalles
    ADD CONSTRAINT nomina_detalles_nomina_id_empleado_id_key UNIQUE (nomina_id, empleado_id);


--
-- TOC entry 3640 (class 2606 OID 31622)
-- Name: nomina_detalles nomina_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina_detalles
    ADD CONSTRAINT nomina_detalles_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 31610)
-- Name: nominas nominas_periodo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nominas
    ADD CONSTRAINT nominas_periodo_key UNIQUE (periodo);


--
-- TOC entry 3634 (class 2606 OID 31608)
-- Name: nominas nominas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nominas
    ADD CONSTRAINT nominas_pkey PRIMARY KEY (id);


--
-- TOC entry 3628 (class 2606 OID 31599)
-- Name: parametros_nomina parametros_nomina_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametros_nomina
    ADD CONSTRAINT parametros_nomina_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 1259 OID 31559)
-- Name: idx_empleados_activos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empleados_activos ON public.empleados USING btree (activo) WHERE activo;


--
-- TOC entry 3621 (class 1259 OID 31580)
-- Name: idx_mov_empleado_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mov_empleado_fecha ON public.movimientos USING btree (empleado_id, fecha);


--
-- TOC entry 3622 (class 1259 OID 31581)
-- Name: idx_mov_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mov_fecha ON public.movimientos USING btree (fecha);


--
-- TOC entry 3635 (class 1259 OID 31636)
-- Name: idx_nom_det_empleado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nom_det_empleado ON public.nomina_detalles USING btree (empleado_id);


--
-- TOC entry 3636 (class 1259 OID 31635)
-- Name: idx_nom_det_nomina; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nom_det_nomina ON public.nomina_detalles USING btree (nomina_id);


--
-- TOC entry 3630 (class 1259 OID 31637)
-- Name: idx_nominas_periodo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nominas_periodo ON public.nominas USING btree (periodo);


--
-- TOC entry 3629 (class 1259 OID 31600)
-- Name: ux_parametros_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_parametros_activo ON public.parametros_nomina USING btree (activo) WHERE activo;


--
-- TOC entry 3645 (class 2620 OID 31642)
-- Name: empleados empleados_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER empleados_set_updated_at BEFORE UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3646 (class 2620 OID 31643)
-- Name: movimientos movimientos_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER movimientos_set_updated_at BEFORE UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3647 (class 2620 OID 31639)
-- Name: movimientos movimientos_validar_cobertura; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER movimientos_validar_cobertura BEFORE INSERT OR UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.trg_validar_cobertura();


--
-- TOC entry 3641 (class 2606 OID 31574)
-- Name: movimientos movimientos_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT movimientos_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- TOC entry 3643 (class 2606 OID 31630)
-- Name: nomina_detalles nomina_detalles_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina_detalles
    ADD CONSTRAINT nomina_detalles_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id);


--
-- TOC entry 3644 (class 2606 OID 31625)
-- Name: nomina_detalles nomina_detalles_nomina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina_detalles
    ADD CONSTRAINT nomina_detalles_nomina_id_fkey FOREIGN KEY (nomina_id) REFERENCES public.nominas(id) ON DELETE CASCADE;


--
-- TOC entry 3642 (class 2606 OID 31611)
-- Name: nominas nominas_parametros_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nominas
    ADD CONSTRAINT nominas_parametros_id_fkey FOREIGN KEY (parametros_id) REFERENCES public.parametros_nomina(id);


-- Completed on 2025-09-17 15:47:28 MST

--
-- PostgreSQL database dump complete
--

\unrestrict 8F148HzhKplT7NtSP4m3ew2PYCTYSh4Za7rZAfPyqCpI65VYIQO1oPpALLyWo6f

