--
-- PostgreSQL database dump
--

\restrict XE3VfxXlgrJdga3B46BqkxdMBhgyU3WqcrYamHZXjj3sjvx68OdkGD5oIVrnDWS

-- Dumped from database version 17.11 (Homebrew)
-- Dumped by pg_dump version 17.11 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: login_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_rate_limits (
    limiter_name text NOT NULL,
    client_key text NOT NULL,
    total_hits integer DEFAULT 0 NOT NULL,
    reset_at timestamp with time zone NOT NULL,
    CONSTRAINT login_rate_limits_hits_check CHECK ((total_hits >= 0))
);


--
-- Name: scheduled_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_shifts (
    id integer NOT NULL,
    schedule_date date NOT NULL,
    slot character varying(30) NOT NULL,
    user_id integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    ends_at_close boolean DEFAULT false NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT scheduled_shifts_end_check CHECK (((ends_at_close AND (end_time IS NULL)) OR ((NOT ends_at_close) AND (end_time IS NOT NULL)))),
    CONSTRAINT scheduled_shifts_slot_check CHECK (((slot)::text = ANY ((ARRAY['driver_one_am'::character varying, 'driver_two_am'::character varying, 'driver_one_pm'::character varying, 'driver_two_pm'::character varying, 'skate_guard_one'::character varying, 'skate_guard_two'::character varying])::text[]))),
    CONSTRAINT scheduled_shifts_time_check CHECK (((end_time IS NULL) OR (end_time <> start_time)))
);


--
-- Name: scheduled_shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.scheduled_shifts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.scheduled_shifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_entries (
    id integer NOT NULL,
    user_id integer NOT NULL,
    clock_in timestamp with time zone NOT NULL,
    clock_out timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT time_entries_clock_order_check CHECK ((clock_out > clock_in)),
    CONSTRAINT time_entries_duration_check CHECK (((clock_out - clock_in) <= '24:00:00'::interval))
);


--
-- Name: time_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.time_entries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.time_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    role character varying(20) NOT NULL,
    pin_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_title character varying(50) NOT NULL,
    deactivated_at timestamp with time zone,
    CONSTRAINT users_job_title_check CHECK (((job_title)::text = ANY ((ARRAY['employee'::character varying, 'manager'::character varying, 'zamboni_driver'::character varying, 'skate_instructor'::character varying, 'skate_guard'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['employee'::character varying, 'manager'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: login_rate_limits login_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_rate_limits
    ADD CONSTRAINT login_rate_limits_pkey PRIMARY KEY (limiter_name, client_key);


--
-- Name: scheduled_shifts scheduled_shifts_date_slot_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shifts
    ADD CONSTRAINT scheduled_shifts_date_slot_unique UNIQUE (schedule_date, slot);


--
-- Name: scheduled_shifts scheduled_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shifts
    ADD CONSTRAINT scheduled_shifts_pkey PRIMARY KEY (id);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: login_rate_limits_reset_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX login_rate_limits_reset_at_idx ON public.login_rate_limits USING btree (reset_at);


--
-- Name: scheduled_shifts_user_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scheduled_shifts_user_date_idx ON public.scheduled_shifts USING btree (user_id, schedule_date);


--
-- Name: time_entries_user_clock_in_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX time_entries_user_clock_in_idx ON public.time_entries USING btree (user_id, clock_in);


--
-- Name: scheduled_shifts scheduled_shifts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shifts
    ADD CONSTRAINT scheduled_shifts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: scheduled_shifts scheduled_shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shifts
    ADD CONSTRAINT scheduled_shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: time_entries time_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict XE3VfxXlgrJdga3B46BqkxdMBhgyU3WqcrYamHZXjj3sjvx68OdkGD5oIVrnDWS

