--
-- PostgreSQL database dump
--

\restrict kS4X7yTClN4BomnItDDybrvDz34BxFBF1ltbdgthge6Cf0fsyZkJcLmRcmG9MvA

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('auth.uid', true);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_databases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_databases (
    id character varying(255) NOT NULL,
    user_id character varying(255),
    name character varying(255),
    date_created timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: user_databases user_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_databases
    ADD CONSTRAINT user_databases_pkey PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT ALL ON SCHEMA public TO cloudsqlsuperuser;


--
-- PostgreSQL database dump complete
--

\unrestrict kS4X7yTClN4BomnItDDybrvDz34BxFBF1ltbdgthge6Cf0fsyZkJcLmRcmG9MvA

