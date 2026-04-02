--
-- PostgreSQL database dump
--

\restrict haXzeD4cnHECtyhYJ7yJ3cSlN0wd06eavY907KaFXurfRasWmtTq7mMxSaXGUwI

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id text DEFAULT 'LEGACY'::text NOT NULL,
    symbol text NOT NULL,
    stock_name text NOT NULL,
    order_type text NOT NULL,
    side text NOT NULL,
    product_type text NOT NULL,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL,
    executed_price numeric(12,2),
    status text DEFAULT 'PENDING'::text NOT NULL,
    total_value numeric(16,2) NOT NULL,
    pnl numeric(16,2),
    placed_at timestamp without time zone DEFAULT now() NOT NULL,
    executed_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    user_id text DEFAULT 'LEGACY'::text NOT NULL,
    symbol text NOT NULL,
    stock_name text NOT NULL,
    quantity integer NOT NULL,
    avg_buy_price numeric(12,2) NOT NULL,
    product_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocks (
    symbol text NOT NULL,
    name text NOT NULL,
    exchange text DEFAULT 'NSE'::text NOT NULL,
    sector text NOT NULL,
    logo_url text,
    current_price numeric(12,2) NOT NULL,
    previous_close numeric(12,2) NOT NULL,
    high numeric(12,2) NOT NULL,
    low numeric(12,2) NOT NULL,
    volume integer DEFAULT 0 NOT NULL,
    market_cap numeric(20,2) NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stocks OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    clerk_id text NOT NULL,
    email text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    profile_photo text,
    is_admin boolean DEFAULT false NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet (
    id integer NOT NULL,
    user_id text DEFAULT 'LEGACY'::text NOT NULL,
    balance numeric(16,2) DEFAULT '1000000'::numeric NOT NULL,
    initial_balance numeric(16,2) DEFAULT '1000000'::numeric NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wallet OWNER TO postgres;

--
-- Name: wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_id_seq OWNER TO postgres;

--
-- Name: wallet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_id_seq OWNED BY public.wallet.id;


--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist (
    id integer NOT NULL,
    user_id text DEFAULT 'LEGACY'::text NOT NULL,
    symbol text NOT NULL,
    added_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.watchlist OWNER TO postgres;

--
-- Name: watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.watchlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.watchlist_id_seq OWNER TO postgres;

--
-- Name: watchlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.watchlist_id_seq OWNED BY public.watchlist.id;


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallet id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet ALTER COLUMN id SET DEFAULT nextval('public.wallet_id_seq'::regclass);


--
-- Name: watchlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist ALTER COLUMN id SET DEFAULT nextval('public.watchlist_id_seq'::regclass);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, symbol, stock_name, order_type, side, product_type, quantity, price, executed_price, status, total_value, pnl, placed_at, executed_at) FROM stdin;
1	user_3BlBBF0PS2TGqmqbqyJHumK1pXK	MARUTI	Maruti Suzuki India Limited	MARKET	BUY	INTRADAY	1	12309.00	12309.00	EXECUTED	12309.00	\N	2026-04-02 06:44:03.926027	2026-04-02 06:44:03.925
2	mobile_s7664ld3vj8rvwz5vy80	3MINDIA	3M India Limited	MARKET	BUY	INTRADAY	1	29720.00	29720.00	EXECUTED	29720.00	\N	2026-04-02 07:07:08.228533	2026-04-02 07:07:08.228
3	mobile_s7664ld3vj8rvwz5vy80	3MINDIA	3M India Limited	MARKET	BUY	INTRADAY	2	29720.00	29720.00	EXECUTED	59440.00	\N	2026-04-02 07:07:23.544949	2026-04-02 07:07:23.544
4	mobile_6t243ybdd6c434cu0uxi	SHANTI	Shanti Overseas (India) Limited	MARKET	BUY	INTRADAY	1	6.51	6.51	EXECUTED	6.51	\N	2026-04-02 07:39:26.766712	2026-04-02 07:39:26.766
5	mobile_6t243ybdd6c434cu0uxi	PAGEIND	Page Industries Limited	MARKET	BUY	INTRADAY	1	33640.00	33640.00	EXECUTED	33640.00	\N	2026-04-02 07:39:37.975311	2026-04-02 07:39:37.974
6	mobile_6t243ybdd6c434cu0uxi	SHANTI	Shanti Overseas (India) Limited	MARKET	SELL	INTRADAY	1	6.51	6.51	EXECUTED	6.51	0.00	2026-04-02 07:41:53.628968	2026-04-02 07:41:53.628
7	mobile_c4h28qsv5fq8ypxmw9rt	BOSCHLTD	Bosch Limited	MARKET	BUY	INTRADAY	1	32175.00	32175.00	EXECUTED	32175.00	\N	2026-04-02 08:18:00.813615	2026-04-02 08:18:00.813
8	mobile_6t243ybdd6c434cu0uxi	MARUTI	Maruti Suzuki India Limited	MARKET	BUY	INTRADAY	5	12579.00	12579.00	EXECUTED	62895.00	\N	2026-04-02 08:34:14.10084	2026-04-02 08:34:14.099
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, user_id, symbol, stock_name, quantity, avg_buy_price, product_type, created_at, updated_at) FROM stdin;
1	user_3BlBBF0PS2TGqmqbqyJHumK1pXK	MARUTI	Maruti Suzuki India Limited	1	12309.00	INTRADAY	2026-04-02 06:44:03.923112	2026-04-02 06:44:03.923112
2	mobile_s7664ld3vj8rvwz5vy80	3MINDIA	3M India Limited	3	29720.00	INTRADAY	2026-04-02 07:07:08.225608	2026-04-02 07:07:23.542
4	mobile_6t243ybdd6c434cu0uxi	PAGEIND	Page Industries Limited	1	33640.00	INTRADAY	2026-04-02 07:39:37.971827	2026-04-02 07:39:37.971827
5	mobile_c4h28qsv5fq8ypxmw9rt	BOSCHLTD	Bosch Limited	1	32175.00	INTRADAY	2026-04-02 08:18:00.809526	2026-04-02 08:18:00.809526
6	mobile_6t243ybdd6c434cu0uxi	MARUTI	Maruti Suzuki India Limited	5	12579.00	INTRADAY	2026-04-02 08:34:14.097336	2026-04-02 08:34:14.097336
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocks (symbol, name, exchange, sector, logo_url, current_price, previous_close, high, low, volume, market_cap, updated_at) FROM stdin;
5PAISA-RE	5Paisa Capital Limited-RE	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
A2ZINFRA	A2Z Infra Engineering Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
AAKASH	Aakash Exploration Services Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
ABMINTLLTD	ABM International Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
AARTIIND	Aarti Industries Limited	NSE	Equities	\N	407.25	411.40	410.60	395.90	807916	0.00	2026-04-02 09:14:28.248
ABBOTINDIA	Abbott India Limited	NSE	Equities	\N	26285.00	26490.00	26550.00	25990.00	2851	0.00	2026-04-02 09:14:28.264
ABREL	Aditya Birla Real Estate Limited	NSE	Real Estate	\N	1128.40	1155.00	1151.50	1105.20	107566	0.00	2026-04-02 09:14:28.282
ACE	Action Construction Equipment Limited	NSE	Equities	\N	807.20	811.50	816.00	776.45	191807	0.00	2026-04-02 09:14:28.301
ACMESOLAR	Acme Solar Holdings Limited	NSE	Equities	\N	274.05	266.80	276.70	264.40	2748363	0.00	2026-04-02 09:14:28.312
ADANIENSOL	Adani Energy Solutions Limited	NSE	Equities	\N	924.15	956.60	944.95	903.15	1413609	0.00	2026-04-02 09:14:28.317
ADROITINFO	Adroit Infotech Limited	NSE	Information Technology	\N	9.16	8.84	9.40	8.53	15221	0.00	2026-04-02 09:14:28.338
ADSL	Allied Digital Services Limited	NSE	Information Technology	\N	97.48	97.46	98.87	93.41	149858	0.00	2026-04-02 09:14:28.341
ADVENTHTL	Advent Hotels International Limited	NSE	Equities	\N	139.25	139.76	140.84	132.00	47555	0.00	2026-04-02 09:14:28.353
AEPL	Artemis Electricals and Projects Limited	NSE	Equities	\N	15.67	15.76	16.04	14.60	10537	0.00	2026-04-02 09:14:28.365
AEROFLEX	Aeroflex Industries Limited	NSE	Equities	\N	247.68	250.64	250.99	241.05	749828	0.00	2026-04-02 09:14:31.23
AFFORDABLE	Affordable Robotic & Automation Limited	NSE	Equities	\N	143.50	140.94	147.56	135.30	51211	0.00	2026-04-02 09:14:31.246
360ONE	360 ONE WAM LIMITED	NSE	Equities	\N	933.75	953.05	940.25	915.00	451241	0.00	2026-04-02 09:08:04.22
ACL	Andhra Cements Limited	NSE	Equities	\N	44.96	42.82	44.96	41.99	32654	0.00	2026-04-02 09:14:28.309
AARTISURF	Aarti Surfactants Limited	NSE	Equities	\N	359.70	351.00	365.00	340.30	10170	0.00	2026-04-02 09:14:28.254
ADVENZYMES	Advanced Enzyme Technologies Limited	NSE	Information Technology	\N	269.85	266.40	272.90	260.00	99194	0.00	2026-04-02 09:14:28.357
20MICRONS	20 Microns Limited	NSE	Equities	\N	151.39	147.48	151.59	141.13	84854	0.00	2026-04-02 08:51:01.287
ABLBL	Aditya Birla Lifestyle Brands Limited	NSE	Equities	\N	92.99	93.52	93.99	90.20	597531	0.00	2026-04-02 09:14:28.279
AEQUS	Aequs Limited	NSE	Equities	\N	123.51	122.91	124.10	120.03	1715476	0.00	2026-04-02 09:14:28.368
3MINDIA	3M India Limited	NSE	Equities	\N	29705.00	29395.00	30095.00	28730.00	5927	0.00	2026-04-02 09:08:04.224
ABDL	Allied Blenders and Distillers Limited	NSE	Equities	\N	422.00	421.55	428.20	406.30	286894	0.00	2026-04-02 09:14:28.272
ADL	Archidply Decor Limited	NSE	Equities	\N	60.98	59.00	60.98	57.01	398	0.00	2026-04-02 09:14:28.334
ACI	Archean Chemical Industries Limited	NSE	Chemicals	\N	584.35	581.20	586.25	567.85	61642	0.00	2026-04-02 09:14:28.306
AFCONS	Afcons Infrastructure Limited	NSE	Equities	\N	281.85	282.40	284.00	274.20	117387	0.00	2026-04-02 09:14:31.241
ADVANCE	Advance Agrolife Limited	NSE	Equities	\N	94.38	92.42	96.25	89.43	112327	0.00	2026-04-02 09:14:28.346
AARVI	Aarvi Encon Limited	NSE	Equities	\N	125.90	127.66	126.96	123.43	6420	0.00	2026-04-02 09:14:28.256
ACCELYA	Accelya Solutions India Limited	NSE	Equities	\N	1127.00	1115.00	1150.00	1080.10	15900	0.00	2026-04-02 09:14:28.291
ADFFOODS	ADF Foods Limited	NSE	Equities	\N	178.69	179.25	179.95	173.21	67529	0.00	2026-04-02 09:14:28.33
5PAISA	5Paisa Capital Limited	NSE	Equities	\N	283.00	270.21	284.89	253.13	95740	0.00	2026-04-02 09:08:04.23
ACC	ACC Limited	NSE	Equities	\N	1315.10	1327.90	1324.00	1289.70	158169	0.00	2026-04-02 09:14:28.288
AETHER	Aether Industries Limited	NSE	Equities	\N	1099.70	1116.00	1119.70	1065.60	230387	0.00	2026-04-02 09:14:31.238
3IINFOLTD	3i Infotech Limited	NSE	Information Technology	\N	14.85	14.30	14.95	13.96	735419	0.00	2026-04-02 09:08:04.222
AAATECH	AAA Technologies Limited	NSE	Information Technology	\N	93.38	91.96	93.49	91.08	4563	0.00	2026-04-02 09:08:04.236
AARTIDRUGS	Aarti Drugs Limited	NSE	Pharmaceuticals	\N	350.70	346.40	354.60	335.55	92814	0.00	2026-04-02 09:14:28.246
ABCAPITAL	Aditya Birla Capital Limited	NSE	Equities	\N	294.95	302.90	298.90	287.70	2839018	0.00	2026-04-02 09:14:28.266
ABINFRA	A B Infrabuild Limited	NSE	Equities	\N	16.13	15.89	16.29	15.79	735764	0.00	2026-04-02 09:14:28.277
ADANIPOWER	Adani Power Limited	NSE	Equities	\N	158.26	157.11	159.95	150.62	39324065	0.00	2026-04-02 09:14:28.327
AEROENTER	Aeroflex Enterprises Limited	NSE	Equities	\N	70.22	69.70	71.84	66.83	281304	0.00	2026-04-02 09:14:28.373
AARNAV	Aarnav Fashions Limited	NSE	Equities	\N	23.41	23.56	23.67	22.62	18940	0.00	2026-04-02 09:14:28.238
AARON	Aaron Industries Limited	NSE	Equities	\N	130.90	122.54	132.29	116.99	22312	0.00	2026-04-02 09:14:28.24
AEGISVOPAK	Aegis Vopak Terminals Limited	NSE	Equities	\N	166.85	167.87	167.45	160.91	556616	0.00	2026-04-02 09:14:28.362
AAREYDRUGS	Aarey Drugs & Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	54.98	53.28	54.99	52.28	42213	0.00	2026-04-02 09:14:28.235
ACEINTEG	Ace Integrated Solutions Limited	NSE	Equities	\N	17.00	16.43	17.00	16.03	3039	0.00	2026-04-02 09:14:28.303
ACCURACY	Accuracy Shipping Limited	NSE	Equities	\N	3.85	3.73	3.94	3.65	72698	0.00	2026-04-02 09:14:28.298
AADHARHFC	Aadhar Housing Finance Limited	NSE	Equities	\N	438.60	451.15	448.00	433.25	127425	0.00	2026-04-02 09:14:28.23
AARTECH	Aartech Solonics Limited	NSE	Information Technology	\N	38.12	36.64	38.12	35.19	44680	0.00	2026-04-02 09:14:28.243
AAVAS	Aavas Financiers Limited	NSE	Equities	\N	1134.30	1134.20	1135.50	1101.30	115948	0.00	2026-04-02 09:14:28.258
3PLAND	3P Land Holdings Limited	NSE	Equities	\N	32.48	31.46	32.90	30.03	1781	0.00	2026-04-02 09:08:04.228
AFFLE	Affle 3i Limited	NSE	Equities	\N	1421.30	1437.40	1436.00	1400.80	105136	0.00	2026-04-02 09:14:31.244
ADVAIT	Advait Energy Transitions Limited	NSE	Equities	\N	1763.60	1737.50	1780.00	1690.10	42947	0.00	2026-04-02 09:14:28.344
AEGISLOG	Aegis Logistics Limited	NSE	Equities	\N	587.00	603.40	601.55	585.10	392318	0.00	2026-04-02 09:14:28.36
ADANIGREEN	Adani Green Energy Limited	NSE	Energy	\N	841.25	851.95	845.85	814.75	8389827	0.00	2026-04-02 09:14:28.322
ABB	ABB India Limited	NSE	Equities	\N	6095.00	6063.00	6133.50	5916.50	236417	0.00	2026-04-02 09:14:28.261
ABFRL	Aditya Birla Fashion and Retail Limited	NSE	Equities	\N	56.84	58.05	57.58	55.22	2955138	0.00	2026-04-02 09:14:28.274
AFIL	Akme Fintrade (India) Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
AGSTRA	AGS Transact Technologies Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
AHLWEST	Asian Hotels (West) Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
ANKITMETAL	Ankit Metal & Power Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
ANSALAPI	Ansal Properties & Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
AHLEAST	Asian Hotels (East) Limited	NSE	Equities	\N	151.50	150.85	154.90	150.00	10384	0.00	2026-04-02 09:14:31.275
AHLUCONT	Ahluwalia Contracts (India) Limited	NSE	Equities	\N	690.05	679.25	698.85	659.45	39392	0.00	2026-04-02 09:14:31.278
AIAENG	AIA Engineering Limited	NSE	Equities	\N	3628.90	3681.00	3677.00	3555.20	19978	0.00	2026-04-02 09:14:31.281
AIIL	Authum Investment & Infrastructure Limited	NSE	Equities	\N	418.00	432.50	428.50	409.15	681493	0.00	2026-04-02 09:14:31.284
AIRAN	Airan Limited	NSE	Equities	\N	14.78	14.11	15.00	13.52	65954	0.00	2026-04-02 09:14:31.286
AIROLAM	Airo Lam limited	NSE	Equities	\N	84.37	84.23	86.09	84.15	1035	0.00	2026-04-02 09:14:31.29
AJAXENGG	Ajax Engineering Limited	NSE	Equities	\N	433.40	431.55	442.90	416.60	324175	0.00	2026-04-02 09:14:31.297
AJMERA	Ajmera Realty & Infra India Limited	NSE	Real Estate	\N	106.52	104.97	109.87	100.57	167763	0.00	2026-04-02 09:14:31.299
AJOONI	Ajooni Biotech Limited	NSE	Information Technology	\N	4.09	4.11	4.10	3.99	257416	0.00	2026-04-02 09:14:31.302
AKASH	Akash Infra-Projects Limited	NSE	Equities	\N	25.00	24.98	25.27	24.16	1696	0.00	2026-04-02 09:14:31.305
AKG	Akg Exim Limited	NSE	Equities	\N	10.05	10.05	10.37	9.61	7004	0.00	2026-04-02 09:14:31.307
AKI	AKI India Limited	NSE	Equities	\N	4.50	4.15	4.55	4.05	82017	0.00	2026-04-02 09:14:31.311
AKSHAR	Akshar Spintex Limited	NSE	Equities	\N	0.45	0.40	0.46	0.39	2329107	0.00	2026-04-02 09:14:31.314
AKSHOPTFBR	Aksh Optifibre Limited	NSE	Equities	\N	4.52	4.41	4.57	4.26	238274	0.00	2026-04-02 09:14:31.32
AKUMS	Akums Drugs and Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	498.00	496.45	504.00	479.55	134200	0.00	2026-04-02 09:14:31.322
AKZOINDIA	Akzo Nobel India Limited	NSE	Equities	\N	2976.90	2871.50	3050.00	2758.00	83215	0.00	2026-04-02 09:14:31.325
ALANKIT	Alankit Limited	NSE	Equities	\N	7.69	7.19	7.70	7.04	239887	0.00	2026-04-02 09:14:31.328
ALGOQUANT	Algoquant Fintech Limited	NSE	Information Technology	\N	52.17	50.89	52.81	49.15	861836	0.00	2026-04-02 09:14:31.336
ALICON	Alicon Castalloy Limited	NSE	Equities	\N	610.95	617.45	620.95	596.20	7115	0.00	2026-04-02 09:14:31.338
ALIVUS	Alivus Life Sciences Limited	NSE	Equities	\N	979.20	984.20	992.00	957.00	31565	0.00	2026-04-02 09:14:31.343
ALKALI	Alkali Metals Limited	NSE	Equities	\N	52.03	49.72	52.99	48.27	4238	0.00	2026-04-02 09:14:31.346
ALKEM	Alkem Laboratories Limited	NSE	Equities	\N	5233.00	5244.50	5254.50	5075.00	60156	0.00	2026-04-02 09:14:31.348
ALKYLAMINE	Alkyl Amines Chemicals Limited	NSE	Chemicals	\N	1307.40	1315.40	1321.00	1243.30	60263	0.00	2026-04-02 09:14:31.353
ALLDIGI	Alldigi Tech Limited	NSE	Information Technology	\N	780.00	754.60	798.00	737.00	6902	0.00	2026-04-02 09:14:31.361
ALLTIME	All Time Plastics Limited	NSE	Chemicals	\N	198.50	198.53	201.01	190.80	47378	0.00	2026-04-02 09:14:31.364
ALMONDZ	Almondz Global Securities Limited	NSE	Equities	\N	11.82	11.96	12.09	11.52	52698	0.00	2026-04-02 09:14:31.367
ALOKINDS	Alok Industries Limited	NSE	Equities	\N	12.35	12.45	12.58	11.87	7735245	0.00	2026-04-02 09:14:31.369
ALPA	Alpa Laboratories Limited	NSE	Equities	\N	51.78	50.21	51.84	48.60	26489	0.00	2026-04-02 09:14:31.372
ALPHAGEO	Alphageo (India) Limited	NSE	Equities	\N	183.85	183.03	187.60	177.55	5506	0.00	2026-04-02 09:14:31.375
AMANTA	Amanta Healthcare Limited	NSE	Healthcare	\N	108.00	105.81	108.90	102.00	222037	0.00	2026-04-02 09:14:34.23
AMBER	Amber Enterprises India Limited	NSE	Equities	\N	6223.50	6579.50	6520.00	6215.50	348784	0.00	2026-04-02 09:14:34.234
AMBICAAGAR	Ambica Agarbathies & Aroma industries Limited	NSE	Equities	\N	22.20	22.15	23.49	21.83	24574	0.00	2026-04-02 09:14:34.237
AMBIKCO	Ambika Cotton Mills Limited	NSE	Textile	\N	1257.60	1243.20	1271.50	1200.10	4433	0.00	2026-04-02 09:14:34.239
AMBUJACEM	Ambuja Cements Limited	NSE	Equities	\N	414.15	420.35	417.80	406.70	1414624	0.00	2026-04-02 09:14:34.242
AMDIND	AMD Industries Limited	NSE	Equities	\N	38.00	37.89	38.00	33.77	9440	0.00	2026-04-02 09:14:34.245
AMJLAND	Amj Land Holdings Limited	NSE	Equities	\N	36.39	35.63	36.50	34.00	10806	0.00	2026-04-02 09:14:34.25
AMNPLST	Amines & Plasticizers Limited	NSE	Chemicals	\N	140.01	136.27	145.69	131.65	4016	0.00	2026-04-02 09:14:34.252
AMRUTANJAN	Amrutanjan Health Care Limited	NSE	Healthcare	\N	510.55	499.50	515.95	489.25	7863	0.00	2026-04-02 09:14:34.255
ANANDRATHI	Anand Rathi Wealth Limited	NSE	Equities	\N	3205.00	3114.60	3224.00	3052.60	186982	0.00	2026-04-02 09:14:34.258
ANANTRAJ	Anant Raj Limited	NSE	Equities	\N	445.60	448.20	451.20	427.10	1946999	0.00	2026-04-02 09:14:34.261
ANDHRAPAP	ANDHRA PAPER LIMITED	NSE	Equities	\N	60.00	60.86	61.69	59.16	72896	0.00	2026-04-02 09:14:34.263
ANGELONE	Angel One Limited	NSE	Equities	\N	240.04	240.60	241.39	228.45	5704943	0.00	2026-04-02 09:14:34.268
ANIKINDS	Anik Industries Limited	NSE	Equities	\N	36.39	35.35	37.00	33.50	5355	0.00	2026-04-02 09:14:34.271
ANMOL	Anmol India Limited	NSE	Equities	\N	10.53	9.46	11.20	9.29	383581	0.00	2026-04-02 09:14:34.274
ANTELOPUS	Antelopus Selan Energy Limited	NSE	Equities	\N	580.00	587.50	585.95	562.50	149391	0.00	2026-04-02 09:14:34.276
ANTGRAPHIC	Antarctica Limited	NSE	Equities	\N	0.77	0.77	0.77	0.72	109960	0.00	2026-04-02 09:14:34.279
ANTHEM	Anthem Biosciences Limited	NSE	Equities	\N	658.85	665.70	662.30	648.25	333645	0.00	2026-04-02 09:14:34.282
AGARWALEYE	Dr. Agarwal's Health Care Limited	NSE	Healthcare	\N	415.50	419.50	418.20	410.50	30606	0.00	2026-04-02 09:14:31.255
AGI	AGI Greenpac Limited	NSE	Equities	\N	497.80	502.75	502.50	481.00	79396	0.00	2026-04-02 09:14:31.257
AGIIL	Agi Infra Limited	NSE	Equities	\N	293.25	288.75	295.35	281.05	1635365	0.00	2026-04-02 09:14:31.26
AGRITECH	Agri-Tech (India) Limited	NSE	Information Technology	\N	105.52	100.04	107.04	96.00	7236	0.00	2026-04-02 09:14:31.262
AGROPHOS	Agro Phos India Limited	NSE	Equities	\N	27.70	26.28	27.79	25.12	17859	0.00	2026-04-02 09:14:31.267
AHCL	Anlon Healthcare Limited	NSE	Healthcare	\N	113.20	113.07	114.39	111.02	65998	0.00	2026-04-02 09:14:31.27
ARSHIYA	Arshiya Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.39979
ANUP	The Anup Engineering Limited	NSE	Equities	\N	1740.00	1728.80	1755.00	1652.20	48703	0.00	2026-04-02 09:14:34.288
ANURAS	Anupam Rasayan India Limited	NSE	Equities	\N	1258.40	1276.40	1265.30	1236.50	214141	0.00	2026-04-02 09:14:34.291
APARINDS	Apar Industries Limited	NSE	Equities	\N	9709.00	9774.50	9758.50	9298.50	91900	0.00	2026-04-02 09:14:34.293
APCL	Anjani Portland Cement Limited	NSE	Equities	\N	106.80	104.78	111.80	103.02	5381	0.00	2026-04-02 09:14:34.296
APCOTEXIND	Apcotex Industries Limited	NSE	Equities	\N	348.95	345.85	355.00	336.40	19390	0.00	2026-04-02 09:14:34.299
APLAPOLLO	APL Apollo Tubes Limited	NSE	Equities	\N	1877.80	1934.80	1929.00	1834.00	399938	0.00	2026-04-02 09:14:34.304
APLLTD	Alembic Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	653.80	677.05	673.55	650.00	41801	0.00	2026-04-02 09:14:34.306
APOLLO	Apollo Micro Systems Limited	NSE	Equities	\N	194.50	195.77	197.80	189.40	3610923	0.00	2026-04-02 09:14:34.309
APOLLOHOSP	Apollo Hospitals Enterprise Limited	NSE	Healthcare	\N	7328.50	7305.50	7368.00	7150.50	231821	0.00	2026-04-02 09:14:34.312
APOLLOPIPE	Apollo Pipes Limited	NSE	Equities	\N	430.75	427.90	437.30	415.40	460415	0.00	2026-04-02 09:14:34.314
APOLLOTYRE	Apollo Tyres Limited	NSE	Equities	\N	407.75	415.25	413.05	402.65	324666	0.00	2026-04-02 09:14:34.317
APTECHT	Aptech Limited	NSE	Information Technology	\N	76.10	76.62	76.92	73.30	80071	0.00	2026-04-02 09:14:34.322
APTUS	Aptus Value Housing Finance India Limited	NSE	Equities	\N	198.98	203.70	202.40	195.50	2902331	0.00	2026-04-02 09:14:34.324
AQYLON	Aqylon Nexus Limited	NSE	Equities	\N	45.77	48.17	45.77	45.77	7932	0.00	2026-04-02 09:14:34.327
ARCHIDPLY	Archidply Industries Limited	NSE	Equities	\N	67.59	68.14	69.00	66.20	25784	0.00	2026-04-02 09:14:34.329
ARCHIES	Archies Limited	NSE	Equities	\N	13.69	12.04	14.36	11.90	134879	0.00	2026-04-02 09:14:34.332
ARENTERP	Rajdarshan Industries Limited	NSE	Equities	\N	35.35	33.66	35.70	33.99	551	0.00	2026-04-02 09:14:34.338
ARFIN	Arfin India Limited	NSE	Equities	\N	76.23	75.94	77.40	74.01	739929	0.00	2026-04-02 09:14:34.341
ARIES	Aries Agro Limited	NSE	Equities	\N	339.00	340.60	342.90	330.25	9540	0.00	2026-04-02 09:14:34.348
ARIHANTCAP	Arihant Capital Markets Limited	NSE	Equities	\N	62.53	62.90	63.24	60.25	186058	0.00	2026-04-02 09:14:34.351
ARIHANTSUP	Arihant Superstructures Limited	NSE	Equities	\N	210.51	203.04	211.78	198.84	4599	0.00	2026-04-02 09:14:34.355
ARIS	Arisinfra Solutions Limited	NSE	Equities	\N	103.10	103.08	104.75	100.67	335317	0.00	2026-04-02 09:14:34.357
ARKADE	Arkade Developers Limited	NSE	Equities	\N	101.65	102.16	102.50	98.32	254095	0.00	2026-04-02 09:14:34.361
AROGRANITE	Aro Granite Industries Limited	NSE	Equities	\N	21.05	21.17	21.29	20.21	5029	0.00	2026-04-02 09:14:34.366
ARROWGREEN	Arrow Greentech Limited	NSE	Information Technology	\N	498.50	487.15	514.15	450.00	232936	0.00	2026-04-02 09:14:34.368
ARSSBL	Anand Rathi Share and Stock Brokers Limited	NSE	Equities	\N	446.00	450.15	451.20	429.90	233110	0.00	2026-04-02 09:14:37.23
ARTEMISMED	Artemis Medicare Services Limited	NSE	Healthcare	\N	224.22	222.56	225.25	215.02	39891	0.00	2026-04-02 09:14:37.234
ARTNIRMAN	Art Nirman Limited	NSE	Equities	\N	35.13	31.94	35.13	31.50	21249	0.00	2026-04-02 09:14:37.237
ARVEE	Arvee Laboratories (India) Limited	NSE	Equities	\N	138.00	143.96	147.84	136.00	157	0.00	2026-04-02 09:14:37.24
ARVIND	Arvind Limited	NSE	Equities	\N	360.65	350.65	363.95	339.45	464910	0.00	2026-04-02 09:14:37.242
ARVSMART	Arvind SmartSpaces Limited	NSE	Equities	\N	525.75	528.65	529.15	514.00	21601	0.00	2026-04-02 09:14:37.247
ASAHIINDIA	Asahi India Glass Limited	NSE	Equities	\N	812.85	822.70	817.35	790.75	53073	0.00	2026-04-02 09:14:37.251
ASAHISONG	Asahi Songwon Colors Limited	NSE	Equities	\N	204.93	200.75	206.36	196.41	4926	0.00	2026-04-02 09:14:37.254
ASAL	Automotive Stampings and Assemblies Limited	NSE	Equities	\N	414.00	407.55	416.85	395.00	10344	0.00	2026-04-02 09:14:37.256
ASALCBR	Associated Alcohols & Breweries Ltd.	NSE	Equities	\N	715.70	721.80	729.00	699.65	23628	0.00	2026-04-02 09:14:37.259
ASHAPURMIN	Ashapura Minechem Limited	NSE	Equities	\N	481.20	486.40	489.00	469.55	315127	0.00	2026-04-02 09:14:37.266
ASHIMASYN	Ashima Limited	NSE	Equities	\N	13.12	12.92	13.36	12.41	82340	0.00	2026-04-02 09:14:37.272
ASHOKA	Ashoka Buildcon Limited	NSE	Equities	\N	110.28	110.74	112.64	105.31	1146906	0.00	2026-04-02 09:14:37.274
ASHOKLEY	Ashok Leyland Limited	NSE	Automobile	\N	147.35	149.11	148.35	143.13	28520488	0.00	2026-04-02 09:14:37.28
ASIANENE	Asian Energy Services Limited	NSE	Equities	\N	257.61	258.51	263.10	252.10	59898	0.00	2026-04-02 09:14:37.283
ASIANHOTNR	Asian Hotels (North) Limited	NSE	Equities	\N	292.00	289.30	296.80	287.15	2261	0.00	2026-04-02 09:14:37.285
ASKAUTOLTD	ASK Automotive Limited	NSE	Equities	\N	435.20	435.70	437.65	422.00	55431	0.00	2026-04-02 09:14:37.294
ASMS	Bartronics India Limited	NSE	Equities	\N	7.94	7.59	8.09	7.32	1824956	0.00	2026-04-02 09:14:37.297
ASPINWALL	Aspinwall and Company Limited	NSE	Equities	\N	207.05	213.09	212.00	203.52	6165	0.00	2026-04-02 09:14:37.3
ASTEC	Astec LifeSciences Limited	NSE	Equities	\N	541.00	557.85	555.00	538.35	39671	0.00	2026-04-02 09:14:37.303
ASTERDM	Aster DM Healthcare Limited	NSE	Healthcare	\N	659.10	687.90	684.50	657.50	328639	0.00	2026-04-02 09:14:37.306
ASTRAL	Astral Limited	NSE	Equities	\N	1525.20	1570.30	1539.80	1456.60	1164842	0.00	2026-04-02 09:14:37.308
ASTRAZEN	AstraZeneca Pharma India Limited	NSE	Pharmaceuticals	\N	7777.00	7852.00	7846.50	7700.00	4940	0.00	2026-04-02 09:14:37.314
ASTRON	Astron Paper & Board Mill Limited	NSE	Equities	\N	3.64	3.54	3.70	3.45	22908	0.00	2026-04-02 09:14:37.317
ATALREAL	Atal Realtech Limited	NSE	Information Technology	\N	24.20	22.67	24.98	22.40	4929801	0.00	2026-04-02 09:14:37.32
ATAM	Atam Valves Limited	NSE	Equities	\N	52.43	52.06	53.37	51.01	7467	0.00	2026-04-02 09:14:37.323
ASHOKAMET	Ashoka Metcast Limited	NSE	Equities	\N	13.26	13.07	13.26	12.80	12143	0.00	2026-04-02 09:14:37.277
ATGL	Adani Total Gas Limited	NSE	Equities	\N	517.45	520.90	522.20	509.15	1123504	0.00	2026-04-02 09:14:37.328
ATHERENERG	Ather Energy Limited	NSE	Equities	\N	762.00	771.05	774.90	745.00	1304916	0.00	2026-04-02 09:14:37.331
ATL	Allcargo Terminals Limited	NSE	Equities	\N	23.76	20.88	24.50	19.78	500974	0.00	2026-04-02 09:14:37.334
ATLANTAA	ATLANTAA LIMITED	NSE	Equities	\N	37.82	36.97	37.89	35.25	32731	0.00	2026-04-02 09:14:37.337
ATLASCYCLE	Atlas Cycles (Haryana) Limited	NSE	Equities	\N	84.80	81.68	84.80	78.70	1408	0.00	2026-04-02 09:14:37.346
ATUL	Atul Limited	NSE	Equities	\N	6289.50	6436.50	6410.00	6260.00	9760	0.00	2026-04-02 09:14:37.349
AUSOMENT	Ausom Enterprise Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
AXITA	Axita Cotton Limited	NSE	Textile	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
AURIGROW	Auri Grow India Limited	NSE	Equities	\N	0.27	0.26	0.27	0.27	11742843	0.00	2026-04-02 09:14:37.357
BCG	Brightcom Group Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
AURIONPRO	Aurionpro Solutions Limited	NSE	Equities	\N	769.15	783.25	784.30	742.70	116395	0.00	2026-04-02 09:14:37.359
AUROPHARMA	Aurobindo Pharma Limited	NSE	Pharmaceuticals	\N	1326.10	1342.10	1338.90	1266.10	1486911	0.00	2026-04-02 09:14:37.487
AURUM	Aurum PropTech Limited	NSE	Information Technology	\N	167.70	165.86	168.94	164.00	30143	0.00	2026-04-02 09:14:37.49
AUTOAXLES	Automotive Axles Limited	NSE	Equities	\N	1648.50	1623.60	1668.10	1594.10	6203	0.00	2026-04-02 09:14:37.494
AVADHSUGAR	Avadh Sugar & Energy Limited	NSE	Equities	\N	465.10	469.95	474.40	460.00	78469	0.00	2026-04-02 09:14:37.5
AVALON	Avalon Technologies Limited	NSE	Information Technology	\N	935.95	936.85	949.00	910.00	75417	0.00	2026-04-02 09:14:37.503
AVANTEL	Avantel Limited	NSE	Equities	\N	133.00	134.28	134.90	129.40	969062	0.00	2026-04-02 09:14:37.506
AVANTIFEED	Avanti Feeds Limited	NSE	Equities	\N	1198.70	1223.60	1222.00	1169.40	296842	0.00	2026-04-02 09:14:40.232
AVG	AVG Logistics Limited	NSE	Equities	\N	142.61	145.40	145.00	138.81	72705	0.00	2026-04-02 09:14:40.301
AVL	Aditya Vision Limited	NSE	Equities	\N	461.10	468.05	465.75	453.00	54808	0.00	2026-04-02 09:14:40.305
AVROIND	AVRO INDIA LIMITED	NSE	Equities	\N	116.23	113.37	118.85	113.02	5929	0.00	2026-04-02 09:14:40.31
AVTNPL	AVT Natural Products Limited	NSE	Equities	\N	58.39	56.91	58.68	56.00	28864	0.00	2026-04-02 09:14:40.313
AWFIS	Awfis Space Solutions Limited	NSE	Equities	\N	249.98	250.32	254.00	238.74	238075	0.00	2026-04-02 09:14:40.316
AWHCL	Antony Waste Handling Cell Limited	NSE	Equities	\N	424.85	404.35	433.70	390.00	180521	0.00	2026-04-02 09:14:40.319
AWL	AWL Agri Business Limited	NSE	Equities	\N	181.80	182.63	182.79	177.20	1365061	0.00	2026-04-02 09:14:40.322
AXISBANK	Axis Bank Limited	NSE	Banking	\N	1188.50	1193.10	1195.30	1150.30	6780435	0.00	2026-04-02 09:14:40.325
AYE	Aye Finance Limited	NSE	Equities	\N	90.63	96.44	95.12	88.22	2326019	0.00	2026-04-02 09:14:40.331
AZAD	Azad Engineering Limited	NSE	Equities	\N	1550.60	1534.70	1568.10	1478.00	143566	0.00	2026-04-02 09:14:40.337
BAFNAPH	Bafna Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	113.99	111.96	115.00	110.00	1142	0.00	2026-04-02 09:14:40.339
BAGFILMS	B.A.G Films and Media Limited	NSE	Equities	\N	4.25	4.28	4.41	4.11	103324	0.00	2026-04-02 09:14:40.342
BAIDFIN	Baid Finserv Limited	NSE	Equities	\N	10.09	10.15	10.16	9.82	53865	0.00	2026-04-02 09:14:40.345
BAJAJ-AUTO	Bajaj Auto Limited	NSE	Automobile	\N	8776.00	8895.50	8835.50	8624.00	179375	0.00	2026-04-02 09:14:40.348
BAJAJELEC	Bajaj Electricals Limited	NSE	Equities	\N	346.05	345.65	349.85	335.70	77562	0.00	2026-04-02 09:14:40.353
BAJAJHCARE	Bajaj Healthcare Limited	NSE	Healthcare	\N	307.00	311.70	313.25	300.00	78354	0.00	2026-04-02 09:14:40.359
BAJAJHFL	Bajaj Housing Finance Limited	NSE	Equities	\N	77.24	77.22	77.74	74.83	5352481	0.00	2026-04-02 09:14:40.361
BAJAJHIND	Bajaj Hindusthan Sugar Limited	NSE	Equities	\N	16.96	16.96	17.23	16.41	8560641	0.00	2026-04-02 09:14:40.364
BAJAJINDEF	Indef Manufacturing Limited	NSE	Equities	\N	234.20	231.07	238.98	220.31	26389	0.00	2026-04-02 09:14:40.368
BAJEL	Bajel Projects Limited	NSE	Equities	\N	149.91	154.13	153.29	147.30	417263	0.00	2026-04-02 09:14:40.371
BALAJITELE	Balaji Telefilms Limited	NSE	Equities	\N	81.35	79.68	83.59	75.76	278825	0.00	2026-04-02 09:14:40.378
BALAMINES	Balaji Amines Limited	NSE	Equities	\N	1046.80	1021.10	1056.00	988.50	68026	0.00	2026-04-02 09:14:40.381
BALAXI	BALAXI PHARMACEUTICALS LIMITED	NSE	Pharmaceuticals	\N	21.14	18.80	21.43	18.02	163137	0.00	2026-04-02 09:14:40.383
BALKRISHNA	Balkrishna Paper Mills Limited	NSE	Equities	\N	14.00	14.12	14.00	13.80	20752	0.00	2026-04-02 09:14:40.386
BALKRISIND	Balkrishna Industries Limited	NSE	Equities	\N	2055.00	2127.60	2100.00	2018.00	157407	0.00	2026-04-02 09:14:40.388
BALMLAWRIE	Balmer Lawrie & Company Limited	NSE	Equities	\N	158.74	158.49	159.30	153.00	98590	0.00	2026-04-02 09:14:40.391
BALPHARMA	Bal Pharma Limited	NSE	Pharmaceuticals	\N	66.39	64.87	66.99	62.16	4773	0.00	2026-04-02 09:14:40.393
BALUFORGE	Balu Forge Industries Limited	NSE	Equities	\N	423.20	424.60	432.05	404.05	568463	0.00	2026-04-02 09:14:40.398
BANARBEADS	Banaras Beads Limited	NSE	Equities	\N	104.81	104.45	108.97	102.99	1173	0.00	2026-04-02 09:14:40.403
BANARISUG	Bannari Amman Sugars Limited	NSE	Equities	\N	3625.00	3650.60	3656.00	3605.20	37	0.00	2026-04-02 09:14:40.406
BANCOINDIA	Banco Products (I) Limited	NSE	Equities	\N	516.85	539.65	529.95	510.45	200548	0.00	2026-04-02 09:14:40.412
BANDHANBNK	Bandhan Bank Limited	NSE	Banking	\N	144.64	147.67	146.46	140.70	6579109	0.00	2026-04-02 09:14:40.414
BANG	Bang Overseas Limited	NSE	Equities	\N	30.00	29.81	31.50	28.79	6508	0.00	2026-04-02 09:14:40.417
BANKA	Banka BioLoo Limited	NSE	Banking	\N	46.61	45.98	48.00	44.26	645	0.00	2026-04-02 09:14:40.419
BANKINDIA	Bank of India	NSE	Banking	\N	137.49	141.70	139.50	134.52	7280474	0.00	2026-04-02 09:14:40.428
BANSALWIRE	Bansal Wire Industries Limited	NSE	Equities	\N	250.54	234.79	258.26	227.41	518668	0.00	2026-04-02 09:14:40.431
BANSWRAS	Banswara Syntex Limited	NSE	Equities	\N	104.32	101.01	107.02	97.50	65394	0.00	2026-04-02 09:14:40.434
BASF	BASF India Limited	NSE	Equities	\N	3277.00	3271.70	3309.10	3174.60	10424	0.00	2026-04-02 09:14:40.438
BAYERCROP	Bayer Cropscience Limited	NSE	Equities	\N	4767.50	4743.50	4778.00	4584.00	13913	0.00	2026-04-02 09:14:43.233
BBL	Bharat Bijlee Limited	NSE	Equities	\N	2233.40	2212.10	2250.00	2130.00	18734	0.00	2026-04-02 09:14:43.237
BBOX	Black Box Limited	NSE	Equities	\N	470.90	477.55	474.35	460.00	116104	0.00	2026-04-02 09:14:43.239
BBTC	The Bombay Burmah Trading Corporation Limited	NSE	Equities	\N	1402.60	1404.40	1416.00	1356.10	26835	0.00	2026-04-02 09:14:43.242
BBTCL	B&B Triplewall Containers Limited	NSE	Equities	\N	171.00	174.38	177.00	167.01	977	0.00	2026-04-02 09:14:43.244
ATULAUTO	Atul Auto Limited	NSE	Equities	\N	406.20	413.10	413.40	396.30	110702	0.00	2026-04-02 09:14:37.352
AUBANK	AU Small Finance Bank Limited	NSE	Banking	\N	857.65	874.90	864.75	831.65	1799731	0.00	2026-04-02 09:14:37.354
BAJAJHLDNG	Bajaj Holdings & Investment Limited	NSE	Equities	\N	8932.00	8907.00	8960.00	8588.00	41711	0.00	2026-04-02 09:14:40.366
BATAINDIA	Bata India Limited	NSE	Equities	\N	645.95	628.05	656.95	612.00	297308	0.00	2026-04-02 09:14:43.23
BEDMUTHA	Bedmutha Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BESTAGRO	Best Agrolife Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BFUTILITIE	BF Utilities Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BGRENERGY	BGR Energy Systems Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BILVYAPAR	BIL VYAPAR LIMITED	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BLBLIMITED	BLB Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BOHRAIND	Bohra Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BONLON	Bonlon Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BORANA	Borana Weaves Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BELLACASA	Bella Casa Fashion & Retail Limited	NSE	Equities	\N	239.53	262.38	257.95	224.98	46263	0.00	2026-04-02 09:14:43.267
BELRISE	Belrise Industries Limited	NSE	Equities	\N	189.00	189.34	189.78	184.21	2377751	0.00	2026-04-02 09:14:43.27
BEML	BEML Limited	NSE	Equities	\N	1461.20	1476.80	1474.60	1412.40	264394	0.00	2026-04-02 09:14:43.273
BERGEPAINT	Berger Paints (I) Limited	NSE	Chemicals	\N	416.75	417.80	420.85	405.75	267866	0.00	2026-04-02 09:14:43.28
BETA	Beta Drugs Limited	NSE	Pharmaceuticals	\N	1389.90	1270.10	1405.00	1238.10	14389	0.00	2026-04-02 09:14:43.283
BFINVEST	BF Investment Limited	NSE	Equities	\N	348.15	346.55	351.80	335.00	10600	0.00	2026-04-02 09:14:43.285
BHAGCHEM	Bhagiradha Chemicals & Industries Limited	NSE	Chemicals	\N	193.60	195.50	195.95	185.40	47453	0.00	2026-04-02 09:14:43.288
BHAGERIA	Bhageria Industries Limited	NSE	Equities	\N	144.29	139.60	148.04	135.55	31543	0.00	2026-04-02 09:14:43.29
BHAGYANGR	Bhagyanagar India Limited	NSE	Equities	\N	151.06	151.06	153.41	145.02	85922	0.00	2026-04-02 09:14:43.293
BHARATCOAL	Bharat Coking Coal Limited	NSE	Equities	\N	31.97	31.98	32.32	30.93	6927895	0.00	2026-04-02 09:14:43.299
BHARATGEAR	Bharat Gears Limited	NSE	Equities	\N	90.49	90.78	91.37	87.48	25563	0.00	2026-04-02 09:14:43.304
BHARATRAS	Bharat Rasayan Limited	NSE	Equities	\N	1373.90	1305.90	1402.00	1256.20	34047	0.00	2026-04-02 09:14:43.306
BHARATSE	Bharat Seats Limited	NSE	Equities	\N	151.90	155.84	155.00	146.70	115436	0.00	2026-04-02 09:14:43.309
BHARATWIRE	Bharat Wire Ropes Limited	NSE	Equities	\N	160.99	161.13	163.00	155.13	69356	0.00	2026-04-02 09:14:43.312
BHARTIHEXA	Bharti Hexacom Limited	NSE	Equities	\N	1502.00	1465.60	1518.00	1439.30	180681	0.00	2026-04-02 09:14:43.317
BIGBLOC	Bigbloc Construction Limited	NSE	Equities	\N	47.00	45.86	47.50	42.42	148011	0.00	2026-04-02 09:14:43.321
BIKAJI	Bikaji Foods International Limited	NSE	Equities	\N	624.55	621.40	629.20	608.50	60260	0.00	2026-04-02 09:14:43.324
BIL	Bhartiya International Limited	NSE	Equities	\N	708.60	699.40	718.45	682.60	953	0.00	2026-04-02 09:14:43.327
BIOCON	Biocon Limited	NSE	Equities	\N	350.25	365.20	363.15	342.10	3951620	0.00	2026-04-02 09:14:43.329
BIRLACABLE	Birla Cable Limited	NSE	Equities	\N	113.84	112.74	114.80	108.40	28446	0.00	2026-04-02 09:14:43.335
BIRLACORPN	Birla Corporation Limited	NSE	Equities	\N	882.20	892.20	901.40	852.60	108644	0.00	2026-04-02 09:14:43.337
BIRLAMONEY	Aditya Birla Money Limited	NSE	Equities	\N	109.14	109.18	111.44	104.77	33926	0.00	2026-04-02 09:14:43.339
BIRLANU	BirlaNu Limited	NSE	Equities	\N	1370.80	1362.00	1390.00	1323.90	14310	0.00	2026-04-02 09:14:43.341
BLACKBUCK	BLACKBUCK LIMITED	NSE	Equities	\N	572.35	575.55	575.80	559.00	97784	0.00	2026-04-02 09:14:43.344
BLAL	BEML Land Assets Limited	NSE	Equities	\N	164.26	165.40	166.06	160.82	18844	0.00	2026-04-02 09:14:43.347
BHARATFORG	Bharat Forge Limited	NSE	Equities	\N	1636.40	1668.40	1657.40	1613.40	789125	0.00	2026-04-02 09:14:43.302
BLISSGVS	Bliss GVS Pharma Limited	NSE	Pharmaceuticals	\N	231.41	229.40	236.15	220.30	2007342	0.00	2026-04-02 09:14:43.35
BLKASHYAP	B. L. Kashyap and Sons Limited	NSE	Equities	\N	45.29	45.92	45.95	43.35	230088	0.00	2026-04-02 09:14:43.353
BLS	BLS International Services Limited	NSE	Equities	\N	261.90	255.41	269.95	244.52	4441313	0.00	2026-04-02 09:14:43.355
BLSE	BLS E-Services Limited	NSE	Equities	\N	159.00	162.94	161.00	156.70	68620	0.00	2026-04-02 09:14:43.358
BLUEDART	Blue Dart Express Limited	NSE	Equities	\N	4856.10	4886.80	4899.90	4765.00	10485	0.00	2026-04-02 09:14:43.363
BLUEJET	Blue Jet Healthcare Limited	NSE	Healthcare	\N	351.80	351.00	355.95	335.00	340112	0.00	2026-04-02 09:14:46.233
BLUESTARCO	Blue Star Limited	NSE	Equities	\N	1513.70	1556.30	1534.00	1450.00	1860572	0.00	2026-04-02 09:14:46.237
BMWVENTLTD	BMW Ventures Limited	NSE	Equities	\N	53.77	51.97	54.19	50.40	93608	0.00	2026-04-02 09:14:46.245
BODALCHEM	Bodal Chemicals Limited	NSE	Chemicals	\N	54.26	54.65	54.49	52.23	99907	0.00	2026-04-02 09:14:46.248
BOMDYEING	Bombay Dyeing & Mfg Company Limited	NSE	Equities	\N	101.80	102.29	102.55	98.00	727683	0.00	2026-04-02 09:14:46.251
BOROLTD	Borosil Limited	NSE	Equities	\N	240.00	241.79	240.48	224.66	121512	0.00	2026-04-02 09:14:46.253
BORORENEW	BOROSIL RENEWABLES LIMITED	NSE	Equities	\N	412.00	411.45	420.10	395.90	764137	0.00	2026-04-02 09:14:46.255
BOROSCI	Borosil Scientific Limited	NSE	Equities	\N	110.00	110.78	110.80	105.83	66305	0.00	2026-04-02 09:14:46.259
BOSCH-HCIL	BOSCH HOME COMFORT INDIA LIMITED	NSE	Equities	\N	1129.20	1131.20	1139.90	1088.10	7330	0.00	2026-04-02 09:14:46.262
BOSCHLTD	Bosch Limited	NSE	Equities	\N	32050.00	30635.00	32250.00	29900.00	75038	0.00	2026-04-02 09:14:46.266
BPL	BPL Limited	NSE	Equities	\N	44.71	44.41	45.39	42.01	62703	0.00	2026-04-02 09:14:46.271
BRIGADE	Brigade Enterprises Limited	NSE	Equities	\N	684.80	672.60	689.80	645.75	313492	0.00	2026-04-02 09:14:46.272
BRIGHOTEL	Brigade Hotel Ventures Limited	NSE	Equities	\N	58.65	57.97	58.76	56.71	60141	0.00	2026-04-02 09:14:46.274
BRITANNIA	Britannia Industries Limited	NSE	FMCG	\N	5445.50	5474.00	5460.00	5351.50	325572	0.00	2026-04-02 09:14:46.277
BCLIND	Bcl Industries Limited	NSE	Equities	\N	28.92	28.91	29.80	26.94	731546	0.00	2026-04-02 09:14:43.247
BCONCEPTS	Brand Concepts Limited	NSE	Equities	\N	225.50	223.85	229.12	210.76	10114	0.00	2026-04-02 09:14:43.25
BCPL	BCPL Railway Infrastructure Limited	NSE	Equities	\N	65.01	67.61	67.93	63.99	26287	0.00	2026-04-02 09:14:43.252
BDL	Bharat Dynamics Limited	NSE	Equities	\N	1175.90	1203.90	1187.20	1159.40	1200091	0.00	2026-04-02 09:14:43.255
BECTORFOOD	Mrs. Bectors Food Specialities Limited	NSE	Equities	\N	188.37	188.82	189.61	181.01	373177	0.00	2026-04-02 09:14:43.261
BEL	Bharat Electronics Limited	NSE	Equities	\N	418.65	418.70	423.60	407.50	16273669	0.00	2026-04-02 09:14:43.264
CAPTRUST	Capital Trust Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
CEREBRAINT	Cerebra Integrated Technologies Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.455955
BSE	BSE Limited	NSE	Equities	\N	2824.20	2867.60	2865.00	2763.00	2828713	0.00	2026-04-02 09:14:46.285
BSHSL	Bombay Super Hybrid Seeds Limited	NSE	Equities	\N	86.94	72.84	87.40	79.00	1208791	0.00	2026-04-02 09:14:46.288
BSL	BSL Limited	NSE	Equities	\N	113.34	114.92	114.90	105.22	1083	0.00	2026-04-02 09:14:46.291
BTML	Bodhi Tree Multimedia Limited	NSE	Equities	\N	5.97	6.25	6.25	5.86	521978	0.00	2026-04-02 09:14:46.296
BUILDPRO	Shankara Buildpro Limited	NSE	Equities	\N	1009.50	1007.75	1038.60	959.80	30759	0.00	2026-04-02 09:14:46.298
BUTTERFLY	Butterfly Gandhimathi Appliances Limited	NSE	Equities	\N	600.65	601.90	625.90	591.95	103408	0.00	2026-04-02 09:14:46.3
BVCL	Barak Valley Cements Limited	NSE	Equities	\N	36.05	36.47	37.80	35.15	5827	0.00	2026-04-02 09:14:46.303
CALSOFT	California Software Company Limited	NSE	Information Technology	\N	11.51	11.82	12.09	11.33	35150	0.00	2026-04-02 09:14:46.308
CAMLINFINE	Camlin Fine Sciences Limited	NSE	Equities	\N	101.28	101.56	103.37	97.39	596803	0.00	2026-04-02 09:14:46.31
CAMPUS	Campus Activewear Limited	NSE	Equities	\N	227.05	223.72	227.50	217.06	150853	0.00	2026-04-02 09:14:46.313
CAMS	Computer Age Management Services Limited	NSE	Information Technology	\N	652.65	655.35	658.50	630.45	1408382	0.00	2026-04-02 09:14:46.316
CANBK	Canara Bank	NSE	Banking	\N	125.82	127.30	126.53	121.79	24509946	0.00	2026-04-02 09:14:46.319
CANFINHOME	Can Fin Homes Limited	NSE	Equities	\N	819.55	814.35	825.00	792.05	65846	0.00	2026-04-02 09:14:46.321
CANTABIL	Cantabil Retail India Limited	NSE	Equities	\N	232.63	231.02	235.24	225.41	49674	0.00	2026-04-02 09:14:46.326
CAPACITE	Capacit'e Infraprojects Limited	NSE	Equities	\N	208.74	214.87	213.00	204.02	322072	0.00	2026-04-02 09:14:46.329
CAPILLARY	Capillary Technologies India Limited	NSE	Information Technology	\N	491.55	485.65	499.60	475.10	42897	0.00	2026-04-02 09:14:46.331
CAPITALSFB	Capital Small Finance Bank Limited	NSE	Banking	\N	237.25	228.43	239.34	216.43	23178	0.00	2026-04-02 09:14:46.334
CAPLIPOINT	Caplin Point Laboratories Limited	NSE	Equities	\N	1555.00	1570.10	1570.10	1508.00	47682	0.00	2026-04-02 09:14:46.336
CARBORUNIV	Carborundum Universal Limited	NSE	Equities	\N	855.05	802.50	862.00	791.05	636016	0.00	2026-04-02 09:14:46.34
CARERATING	CARE Ratings Limited	NSE	Equities	\N	1493.10	1509.00	1508.90	1467.00	29494	0.00	2026-04-02 09:14:46.343
CARRARO	Carraro India Limited	NSE	Equities	\N	457.15	467.30	465.00	443.10	31634	0.00	2026-04-02 09:14:46.346
CARYSIL	CARYSIL LIMITED	NSE	Equities	\N	789.00	792.90	809.65	757.20	45935	0.00	2026-04-02 09:14:46.351
CASTROLIND	Castrol India Limited	NSE	Equities	\N	176.24	176.32	177.29	173.52	819950	0.00	2026-04-02 09:14:46.353
CCAVENUE	AvenuesAI Limited	NSE	Equities	\N	14.45	14.35	14.62	13.86	5265599	0.00	2026-04-02 09:14:46.356
CCCL	Consolidated Construction Consortium Limited	NSE	Equities	\N	14.90	14.13	15.20	13.79	451396	0.00	2026-04-02 09:14:46.359
CCHHL	Country Club Hospitality & Holidays Limited	NSE	Healthcare	\N	10.96	11.06	11.48	10.92	40818	0.00	2026-04-02 09:14:46.361
CCL	CCL Products (India) Limited	NSE	Equities	\N	1068.30	1082.30	1075.00	1032.10	105507	0.00	2026-04-02 09:14:46.364
CEATLTD	CEAT Limited	NSE	Equities	\N	3338.30	3385.80	3369.00	3266.00	52156	0.00	2026-04-02 09:14:49.241
CEIGALL	Ceigall India Limited	NSE	Equities	\N	276.00	277.90	281.05	270.35	110149	0.00	2026-04-02 09:14:49.243
CEINSYS	Ceinsys Tech Limited	NSE	Information Technology	\N	980.95	982.90	989.00	936.00	58091	0.00	2026-04-02 09:14:49.247
CELEBRITY	Celebrity Fashions Limited	NSE	Equities	\N	6.55	6.34	6.65	6.05	15579	0.00	2026-04-02 09:14:49.25
CELLO	Cello World Limited	NSE	Equities	\N	402.70	397.00	406.05	385.80	110476	0.00	2026-04-02 09:14:49.252
CEMPRO	Cemindia Projects Limited	NSE	Equities	\N	528.50	532.80	539.95	510.30	267826	0.00	2026-04-02 09:14:49.255
CENTENKA	Century Enka Limited	NSE	Equities	\N	395.55	393.10	399.65	380.60	6998	0.00	2026-04-02 09:14:49.258
CENTRALBK	Central Bank of India	NSE	Banking	\N	32.98	33.08	33.26	32.01	4210498	0.00	2026-04-02 09:14:49.264
CENTRUM	Centrum Capital Limited	NSE	Equities	\N	27.64	28.52	28.38	27.02	162338	0.00	2026-04-02 09:14:49.266
CENTUM	Centum Electronics Limited	NSE	Equities	\N	2845.90	2865.70	2850.00	2730.00	27534	0.00	2026-04-02 09:14:49.27
CENTURYPLY	Century Plyboards (India) Limited	NSE	Equities	\N	721.40	714.95	725.00	700.00	44681	0.00	2026-04-02 09:14:49.274
CERA	Cera Sanitaryware Limited	NSE	Equities	\N	4637.30	4667.40	4667.20	4519.00	4741	0.00	2026-04-02 09:14:49.276
CESC	CESC Limited	NSE	Equities	\N	151.66	153.12	152.89	147.65	1397397	0.00	2026-04-02 09:14:49.279
CGCL	Capri Global Capital Limited	NSE	Equities	\N	166.20	175.98	170.84	162.86	2835587	0.00	2026-04-02 09:14:49.287
CGPOWER	CG Power and Industrial Solutions Limited	NSE	Equities	\N	676.00	680.30	680.00	655.60	1418099	0.00	2026-04-02 09:14:49.293
CHALET	Chalet Hotels Limited	NSE	Equities	\N	721.60	717.75	726.25	696.35	38775	0.00	2026-04-02 09:14:49.296
CHAMBLFERT	Chambal Fertilizers & Chemicals Limited	NSE	Chemicals	\N	449.00	446.20	451.50	433.35	533943	0.00	2026-04-02 09:14:49.299
CHEMBOND	Chembond Material Technologies Limited	NSE	Information Technology	\N	135.50	122.10	141.51	114.01	45238	0.00	2026-04-02 09:14:49.302
CHEMBONDCH	Chembond Chemicals Limited	NSE	Chemicals	\N	137.00	118.94	142.00	114.99	42967	0.00	2026-04-02 09:14:49.304
CHEMFAB	Chemfab Alkalis Limited	NSE	Equities	\N	336.10	326.35	345.00	306.80	11670	0.00	2026-04-02 09:14:49.313
CHEMPLASTS	Chemplast Sanmar Limited	NSE	Equities	\N	254.15	259.85	260.50	246.80	79130	0.00	2026-04-02 09:14:49.315
CHENNPETRO	Chennai Petroleum Corporation Limited	NSE	Energy	\N	1025.10	1017.85	1036.00	981.00	2259863	0.00	2026-04-02 09:14:49.369
CHEVIOT	Cheviot Company Limited	NSE	Equities	\N	964.35	928.05	972.10	919.50	1855	0.00	2026-04-02 09:14:49.373
CHOICEIN	Choice International Limited	NSE	Equities	\N	627.75	640.25	634.35	615.35	365088	0.00	2026-04-02 09:14:49.404
CHOLAHLDNG	Cholamandalam Financial Holdings Limited	NSE	Equities	\N	1371.30	1386.70	1381.10	1327.50	100302	0.00	2026-04-02 09:14:49.412
CIEINDIA	CIE Automotive India Limited	NSE	Equities	\N	453.60	454.95	459.50	441.00	82671	0.00	2026-04-02 09:14:49.415
CIFL	Capital India Finance Limited	NSE	Equities	\N	22.21	21.09	22.32	20.42	141542	0.00	2026-04-02 09:14:49.422
CIGNITITEC	Cigniti Technologies Limited	NSE	Information Technology	\N	1199.00	1136.30	1218.00	1102.50	88285	0.00	2026-04-02 09:14:49.424
BROOKS	Brooks Laboratories Limited	NSE	Equities	\N	52.13	44.53	53.43	45.21	894190	0.00	2026-04-02 09:14:46.283
CLCIND	CLC Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
CLEDUCATE	CL Educate Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
COMPINFO	Compuage Infocom Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
CONSOFINVT	Consolidated Finvest & Holdings Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
CURAA	Cura Technologies Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
CLEANMAX	Clean Max Enviro Energy Solutions Limited	NSE	Equities	\N	810.10	829.45	817.80	793.65	109383	0.00	2026-04-02 09:14:49.452
CLSEL	Chaman Lal Setia Exports Limited	NSE	Equities	\N	240.01	228.99	249.00	218.10	168354	0.00	2026-04-02 09:14:49.455
CMSINFO	CMS Info Systems Limited	NSE	Equities	\N	280.45	281.85	283.50	271.00	349064	0.00	2026-04-02 09:14:49.463
CNL	Creative Newtech Limited	NSE	Information Technology	\N	590.50	555.10	599.00	545.05	6804	0.00	2026-04-02 09:14:49.466
COASTCORP	Coastal Corporation Limited	NSE	Equities	\N	45.49	43.89	45.84	43.00	49878	0.00	2026-04-02 09:14:49.471
COCHINSHIP	Cochin Shipyard Limited	NSE	Equities	\N	1298.00	1338.60	1317.50	1266.80	1879712	0.00	2026-04-02 09:14:49.474
COFFEEDAY	Coffee Day Enterprises Limited	NSE	Equities	\N	22.80	23.84	24.20	22.18	1969831	0.00	2026-04-02 09:14:49.477
COFORGE	Coforge Limited	NSE	Equities	\N	1219.00	1153.90	1235.00	1130.00	5329474	0.00	2026-04-02 09:14:49.479
COHANCE	Cohance Lifesciences Limited	NSE	Equities	\N	306.45	311.95	309.65	300.30	215920	0.00	2026-04-02 09:14:49.483
COLPAL	Colgate Palmolive (India) Limited	NSE	FMCG	\N	1820.00	1819.70	1829.90	1782.10	190643	0.00	2026-04-02 09:14:49.485
COMSYN	Commercial Syn Bags Limited	NSE	Equities	\N	153.14	153.07	154.00	153.00	11070	0.00	2026-04-02 09:14:52.232
CONCOR	Container Corporation of India Limited	NSE	Equities	\N	435.60	444.55	439.45	429.00	1132653	0.00	2026-04-02 09:14:52.235
CONCORDBIO	Concord Biotech Limited	NSE	Information Technology	\N	1021.70	1020.00	1026.60	987.00	162874	0.00	2026-04-02 09:14:52.238
CONFIPET	Confidence Petroleum India Limited	NSE	Energy	\N	49.92	44.03	51.70	42.90	39261600	0.00	2026-04-02 09:14:52.241
CONTROLPR	Control Print Limited	NSE	Equities	\N	571.80	553.65	573.85	540.10	11201	0.00	2026-04-02 09:14:52.244
CORALFINAC	Coral India Finance & Housing Limited	NSE	Equities	\N	27.98	27.22	28.48	26.49	7778	0.00	2026-04-02 09:14:52.246
CORDSCABLE	Cords Cable Industries Limited	NSE	Equities	\N	147.95	146.72	149.11	141.07	19251	0.00	2026-04-02 09:14:52.249
CORONA	CORONA Remedies Limited	NSE	Equities	\N	1496.00	1541.00	1568.00	1485.50	19507	0.00	2026-04-02 09:14:52.255
COSMOFIRST	COSMO FIRST LIMITED	NSE	Equities	\N	613.40	623.95	622.00	598.10	56137	0.00	2026-04-02 09:14:52.258
COUNCODOS	Country Condo's Limited	NSE	Equities	\N	4.13	4.17	4.30	4.00	27997	0.00	2026-04-02 09:14:52.259
CPCAP	CP Capital Limited	NSE	Equities	\N	85.21	83.09	86.01	80.56	13385	0.00	2026-04-02 09:14:52.263
CPEDU	Career Point Edutech Limited	NSE	Information Technology	\N	156.42	154.00	158.00	150.35	3479	0.00	2026-04-02 09:14:52.265
CPPLUS	Aditya Infotech Limited	NSE	Information Technology	\N	1793.50	1790.30	1877.50	1762.00	794546	0.00	2026-04-02 09:14:52.268
CRAFTSMAN	Craftsman Automation Limited	NSE	Equities	\N	6768.00	6838.00	6810.00	6683.00	11043	0.00	2026-04-02 09:14:52.27
CREATIVEYE	Creative Eye Limited	NSE	Equities	\N	6.43	6.03	6.80	5.90	6528	0.00	2026-04-02 09:14:52.275
CREDITACC	CREDITACCESS GRAMEEN LIMITED	NSE	Equities	\N	1177.00	1192.00	1187.00	1158.10	181540	0.00	2026-04-02 09:14:52.278
CREST	Crest Ventures Limited	NSE	Equities	\N	326.95	328.70	331.00	321.30	990	0.00	2026-04-02 09:14:52.281
CRISIL	CRISIL Limited	NSE	Equities	\N	3698.40	3814.90	3770.00	3686.00	102976	0.00	2026-04-02 09:14:52.284
CRIZAC	Crizac Limited	NSE	Equities	\N	191.51	192.59	194.50	181.90	160693	0.00	2026-04-02 09:14:52.287
CROMPTON	Crompton Greaves Consumer Electricals Limited	NSE	Consumer Goods	\N	229.40	232.59	230.69	224.85	1330444	0.00	2026-04-02 09:14:52.29
CROWN	Crown Lifters Limited	NSE	Equities	\N	117.66	116.66	119.99	115.00	8313	0.00	2026-04-02 09:14:52.293
CSLFINANCE	CSL Finance Limited	NSE	Equities	\N	242.16	244.82	243.25	232.00	35184	0.00	2026-04-02 09:14:52.297
CTE	Cambridge Technology Enterprises Limited	NSE	Information Technology	\N	24.57	22.60	24.69	22.65	35225	0.00	2026-04-02 09:14:52.301
CUB	City Union Bank Limited	NSE	Banking	\N	240.13	239.68	240.63	229.96	1735046	0.00	2026-04-02 09:14:52.304
CUBEXTUB	Cubex Tubings Limited	NSE	Equities	\N	83.29	83.80	84.54	79.25	124495	0.00	2026-04-02 09:14:52.306
CUMMINSIND	Cummins India Limited	NSE	Equities	\N	4616.80	4609.10	4652.50	4470.00	461339	0.00	2026-04-02 09:14:52.308
CUPID	Cupid Limited	NSE	Equities	\N	87.20	86.84	87.68	84.80	13331358	0.00	2026-04-02 09:14:52.311
CYBERTECH	Cybertech Systems And Software Limited	NSE	Information Technology	\N	107.79	108.19	108.76	104.64	15987	0.00	2026-04-02 09:14:52.315
CYIENT	Cyient Limited	NSE	Equities	\N	798.70	780.45	805.00	760.35	303247	0.00	2026-04-02 09:14:52.318
CYIENTDLM	Cyient DLM Limited	NSE	Equities	\N	278.05	284.60	281.00	269.00	278104	0.00	2026-04-02 09:14:52.32
DABUR	Dabur India Limited	NSE	FMCG	\N	411.60	414.95	413.95	403.35	846517	0.00	2026-04-02 09:14:52.323
DALBHARAT	Dalmia Bharat Limited	NSE	Equities	\N	1781.30	1806.00	1805.60	1747.10	77516	0.00	2026-04-02 09:14:52.325
DAMCAPITAL	Dam Capital Advisors Limited	NSE	Equities	\N	135.55	135.14	137.92	127.14	460608	0.00	2026-04-02 09:14:52.33
DAMODARIND	Damodar Industries Limited	NSE	Equities	\N	21.50	21.52	21.50	20.75	2538	0.00	2026-04-02 09:14:52.333
DANGEE	Dangee Dums Limited	NSE	Equities	\N	3.15	2.92	3.17	2.57	401829	0.00	2026-04-02 09:14:52.336
DATAMATICS	Datamatics Global Services Limited	NSE	Equities	\N	699.55	692.95	709.50	651.30	118392	0.00	2026-04-02 09:14:52.339
DATAPATTNS	Data Patterns (India) Limited	NSE	Equities	\N	2982.40	3107.60	3069.00	2900.10	819344	0.00	2026-04-02 09:14:52.341
DAVANGERE	Davangere Sugar Company Limited	NSE	Equities	\N	3.73	3.77	3.80	3.71	14052681	0.00	2026-04-02 09:14:52.344
DBCORP	D.B.Corp Limited	NSE	Equities	\N	196.58	192.64	198.73	188.72	46632	0.00	2026-04-02 09:14:52.346
DBL	Dilip Buildcon Limited	NSE	Equities	\N	398.45	406.60	403.90	389.25	123506	0.00	2026-04-02 09:14:52.351
DBOL	Dhampur Bio Organics Limited	NSE	Equities	\N	113.43	113.53	116.38	109.83	325922	0.00	2026-04-02 09:14:52.354
CINELINE	Cineline India Limited	NSE	Equities	\N	80.80	79.94	80.95	78.50	3733	0.00	2026-04-02 09:14:49.432
CINEVISTA	Cinevista Limited	NSE	Equities	\N	14.40	14.76	14.78	14.01	14082	0.00	2026-04-02 09:14:49.436
CLEAN	Clean Science and Technology Limited	NSE	Information Technology	\N	705.00	699.95	721.30	680.80	199382	0.00	2026-04-02 09:14:49.448
DCMFINSERV	DCM Financial Services Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
DCMSIL	DCM Shriram International Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
DHARAN	DHARAN INFRA-EPC LIMITED	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
DJML	DJ Mediaprint & Logistics Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
DCBBANK	DCB Bank Limited	NSE	Banking	\N	164.50	166.84	165.04	158.40	1031564	0.00	2026-04-02 09:14:55.232
DCM	DCM  Limited	NSE	Equities	\N	60.39	61.12	62.00	58.25	8185	0.00	2026-04-02 09:14:55.24
DCMNVL	DCM Nouvelle Limited	NSE	Equities	\N	103.43	102.11	103.43	100.43	3654	0.00	2026-04-02 09:14:55.243
DCMSHRIRAM	DCM Shriram Limited	NSE	Equities	\N	1119.70	1151.90	1148.00	1112.30	38039	0.00	2026-04-02 09:14:55.246
DCMSRIND	DCM Shriram Industries Limited	NSE	Equities	\N	36.38	36.28	36.99	35.21	84747	0.00	2026-04-02 09:14:55.25
DCW	DCW Limited	NSE	Equities	\N	40.15	41.08	40.85	39.01	1371374	0.00	2026-04-02 09:14:55.253
DCXINDIA	DCX Systems Limited	NSE	Equities	\N	162.88	164.96	165.40	158.15	958083	0.00	2026-04-02 09:14:55.258
DDEVPLSTIK	Ddev Plastiks Industries Limited	NSE	Equities	\N	211.10	214.00	214.52	201.00	87941	0.00	2026-04-02 09:14:55.261
DEEPAKFERT	Deepak Fertilizers and Petrochemicals Corporation Limited	NSE	Chemicals	\N	985.10	988.35	997.55	945.00	380268	0.00	2026-04-02 09:14:55.27
DEEPAKNTR	Deepak Nitrite Limited	NSE	Equities	\N	1367.00	1352.20	1380.10	1302.50	103688	0.00	2026-04-02 09:14:55.273
DEEPINDS	Deep Industries Limited	NSE	Equities	\N	433.35	447.85	448.65	432.00	185595	0.00	2026-04-02 09:14:55.276
DELHIVERY	Delhivery Limited	NSE	Equities	\N	422.80	431.40	426.45	415.55	1204266	0.00	2026-04-02 09:14:55.278
DELPHIFX	DELPHI WORLD MONEY LIMITED	NSE	Equities	\N	9.38	8.98	9.82	8.62	1518408	0.00	2026-04-02 09:14:55.281
DELTACORP	Delta Corp Limited	NSE	Equities	\N	54.90	54.31	55.19	51.87	1527114	0.00	2026-04-02 09:14:55.285
DEN	Den Networks Limited	NSE	Equities	\N	24.77	24.85	25.19	23.88	561997	0.00	2026-04-02 09:14:55.291
DENORA	De Nora India Limited	NSE	Equities	\N	723.95	722.40	730.00	710.10	3221	0.00	2026-04-02 09:14:55.294
DENTA	Denta Water and Infra Solutions Limited	NSE	Equities	\N	240.49	238.05	243.79	231.00	147822	0.00	2026-04-02 09:14:55.299
DEVIT	Dev Information Technology Limited	NSE	Information Technology	\N	25.60	25.75	25.75	23.00	32322	0.00	2026-04-02 09:14:55.301
DEVX	Dev Accelerator Limited	NSE	Equities	\N	34.11	33.82	34.20	32.77	35024	0.00	2026-04-02 09:14:55.305
DEVYANI	Devyani International Limited	NSE	Equities	\N	96.30	96.76	96.84	91.55	3261356	0.00	2026-04-02 09:14:55.307
DHANBANK	Dhanlaxmi Bank Limited	NSE	Banking	\N	22.78	22.51	23.00	21.78	691722	0.00	2026-04-02 09:14:55.318
DHANUKA	Dhanuka Agritech Limited	NSE	Information Technology	\N	960.10	943.05	966.70	915.15	18839	0.00	2026-04-02 09:14:55.322
DHARMAJ	Dharmaj Crop Guard Limited	NSE	Equities	\N	244.52	237.69	247.77	233.62	42509	0.00	2026-04-02 09:14:55.325
DHUNINV	Dhunseri Investments Limited	NSE	Equities	\N	750.10	745.95	768.75	715.05	3563	0.00	2026-04-02 09:14:55.332
DIACABS	Diamond Power Infrastructure Limited	NSE	Equities	\N	124.02	125.31	125.92	120.53	1107694	0.00	2026-04-02 09:14:55.335
DIAMINESQ	Diamines & Chemicals Limited	NSE	Chemicals	\N	242.53	241.53	248.00	237.17	12686	0.00	2026-04-02 09:14:55.338
DIAMONDYD	Prataap Snacks Limited	NSE	Equities	\N	966.50	968.50	985.20	940.10	16015	0.00	2026-04-02 09:14:55.342
DICIND	DIC India Limited	NSE	Equities	\N	489.00	502.15	498.95	485.00	290	0.00	2026-04-02 09:14:55.346
DIFFNKG	Diffusion Engineers Limited	NSE	Equities	\N	279.20	269.57	280.99	259.30	65509	0.00	2026-04-02 09:14:55.348
DIGITIDE	Digitide Solutions Limited	NSE	Equities	\N	76.50	77.14	78.98	74.00	381282	0.00	2026-04-02 09:14:55.358
DIGJAMLMTD	Digjam Limited	NSE	Equities	\N	38.05	38.24	40.01	36.64	5272	0.00	2026-04-02 09:14:55.361
DISHTV	Dish TV India Limited	NSE	Equities	\N	2.52	2.20	2.56	2.10	9534288	0.00	2026-04-02 09:14:55.364
DIVGIITTS	Divgi Torqtransfer Systems Limited	NSE	Equities	\N	625.15	631.85	636.40	610.00	12382	0.00	2026-04-02 09:14:55.368
DIVISLAB	Divi's Laboratories Limited	NSE	Equities	\N	5818.50	5906.50	5853.00	5647.50	420135	0.00	2026-04-02 09:14:55.37
DIXON	Dixon Technologies (India) Limited	NSE	Information Technology	\N	9813.00	10254.00	10345.50	9732.00	1032864	0.00	2026-04-02 09:14:55.373
DLF	DLF Limited	NSE	Equities	\N	515.05	509.75	518.80	489.40	5857639	0.00	2026-04-02 09:14:55.376
DMART	Avenue Supermarts Limited	NSE	Equities	\N	4364.40	4271.10	4375.00	4190.30	1173594	0.00	2026-04-02 09:14:55.382
DMCC	DMCC SPECIALITY CHEMICALS LIMITED	NSE	Chemicals	\N	208.99	211.13	211.05	202.01	17863	0.00	2026-04-02 09:14:55.385
DNAMEDIA	Diligent Media Corporation Limited	NSE	Equities	\N	2.79	2.79	2.85	2.70	35574	0.00	2026-04-02 09:14:55.388
DODLA	Dodla Dairy Limited	NSE	Equities	\N	1022.30	1010.50	1031.85	979.50	16288	0.00	2026-04-02 09:14:55.394
DOLATALGO	Dolat Algotech Limited	NSE	Information Technology	\N	70.50	69.90	71.50	66.92	121535	0.00	2026-04-02 09:14:58.23
DOLLAR	Dollar Industries Limited	NSE	Equities	\N	249.40	242.45	252.90	229.26	101255	0.00	2026-04-02 09:14:58.233
DOMS	DOMS Industries Limited	NSE	Equities	\N	2332.30	2345.10	2355.00	2291.50	28268	0.00	2026-04-02 09:14:58.242
DHAMPURSUG	Dhampur Sugar Mills Limited	NSE	Equities	\N	137.39	140.73	140.72	135.36	426384	0.00	2026-04-02 09:14:55.316
DONEAR	Donear Industries Limited	NSE	Equities	\N	86.91	84.21	88.00	83.87	23517	0.00	2026-04-02 09:14:58.244
DPABHUSHAN	D. P. Abhushan Limited	NSE	Equities	\N	996.75	1005.55	1005.00	968.05	4918	0.00	2026-04-02 09:14:58.247
DPSCLTD	DPSC Limited	NSE	Equities	\N	7.75	7.62	7.75	7.36	103563	0.00	2026-04-02 09:14:58.251
DPWIRES	D P Wires Limited	NSE	Equities	\N	140.99	142.84	142.50	138.17	15629	0.00	2026-04-02 09:14:58.255
DRCSYSTEMS	DRC Systems India Limited	NSE	Equities	\N	15.00	15.18	15.10	13.96	68646	0.00	2026-04-02 09:14:58.258
DREAMFOLKS	Dreamfolks Services Limited	NSE	Equities	\N	66.50	67.66	68.00	63.00	288977	0.00	2026-04-02 09:14:58.261
DRREDDY	Dr. Reddy's Laboratories Limited	NSE	Equities	\N	1212.50	1209.60	1220.90	1167.50	2828203	0.00	2026-04-02 09:14:58.266
DBSTOCKBRO	DB (International) Stock Brokers Limited	NSE	Equities	\N	26.11	25.96	26.20	25.25	1070	0.00	2026-04-02 09:14:52.36
DCAL	Dishman Carbogen Amcis Limited	NSE	Equities	\N	144.00	146.14	146.40	139.64	422987	0.00	2026-04-02 09:14:52.363
DECCANCE	Deccan Cements Limited	NSE	Equities	\N	595.65	587.80	601.15	568.10	12825	0.00	2026-04-02 09:14:55.264
E2E	E2E Networks Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
EASTSILK	Eastern Silk Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
EMBDL	Embassy Developments Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.491797
EQUIPPP	Equippp Social Impact Technologies Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
DTIL	Dhunseri Tea & Industries Limited	NSE	Equities	\N	119.00	116.48	119.00	115.01	774	0.00	2026-04-02 09:14:58.275
DUCON	Ducon Infratechnologies Limited	NSE	Information Technology	\N	2.92	2.72	3.10	2.65	534473	0.00	2026-04-02 09:14:58.277
DVL	Dhunseri Ventures Limited	NSE	Equities	\N	209.16	202.98	210.02	196.86	11122	0.00	2026-04-02 09:14:58.28
DWARKESH	Dwarikesh Sugar Industries Limited	NSE	Equities	\N	45.11	46.47	46.00	44.10	1484176	0.00	2026-04-02 09:14:58.284
DYCL	Dynamic Cables Limited	NSE	Equities	\N	266.30	260.56	272.00	251.09	168011	0.00	2026-04-02 09:14:58.287
DYNPRO	Dynemic Products Limited	NSE	Equities	\N	211.22	204.94	216.09	199.55	17101	0.00	2026-04-02 09:14:58.293
EASEMYTRIP	Easy Trip Planners Limited	NSE	Equities	\N	6.41	6.42	6.58	6.14	16965514	0.00	2026-04-02 09:14:58.296
EBGNG	GNG Electronics Limited	NSE	Equities	\N	363.35	362.55	367.90	345.15	139116	0.00	2026-04-02 09:14:58.299
ECLERX	eClerx Services Limited	NSE	Equities	\N	1437.80	1484.20	1455.50	1405.30	245855	0.00	2026-04-02 09:14:58.303
ECOSMOBLTY	Ecos (India) Mobility & Hospitality Limited	NSE	Healthcare	\N	115.60	117.23	119.02	110.55	298980	0.00	2026-04-02 09:14:58.306
EDELWEISS	Edelweiss Financial Services Limited	NSE	Equities	\N	104.70	106.20	106.08	101.72	2387900	0.00	2026-04-02 09:14:58.31
EFCIL	EFC (I) Limited	NSE	Equities	\N	186.69	189.96	189.53	183.00	141831	0.00	2026-04-02 09:14:58.313
EIDPARRY	EID Parry India Limited	NSE	Equities	\N	803.05	814.10	815.60	780.15	190311	0.00	2026-04-02 09:14:58.322
EIEL	Enviro Infra Engineers Limited	NSE	Equities	\N	166.42	163.57	169.39	155.47	7698039	0.00	2026-04-02 09:14:58.324
EIFFL	Euro India Fresh Foods Limited	NSE	Equities	\N	226.00	226.02	233.17	221.87	11147	0.00	2026-04-02 09:14:58.328
EIHAHOTELS	EIH Associated Hotels Limited	NSE	Equities	\N	290.60	281.40	292.70	275.00	25153	0.00	2026-04-02 09:14:58.331
EIHOTEL	EIH Limited	NSE	Equities	\N	285.25	280.00	288.95	271.15	265129	0.00	2026-04-02 09:14:58.334
EKC	Everest Kanto Cylinder Limited	NSE	Equities	\N	105.10	101.53	109.89	96.62	469992	0.00	2026-04-02 09:14:58.339
ELDEHSG	Eldeco Housing And Industries Limited	NSE	Equities	\N	765.00	785.20	799.95	753.55	449	0.00	2026-04-02 09:14:58.342
ELECON	Elecon Engineering Company Limited	NSE	Equities	\N	383.35	381.35	387.35	367.50	342291	0.00	2026-04-02 09:14:58.346
ELECTCAST	Electrosteel Castings Limited	NSE	Metals & Mining	\N	79.18	81.15	81.90	76.61	3167109	0.00	2026-04-02 09:14:58.349
ELECTHERM	Electrotherm (India) Limited	NSE	Equities	\N	585.00	577.95	600.00	552.45	19629	0.00	2026-04-02 09:14:58.354
ELGIEQUIP	Elgi Equipments Limited	NSE	Equities	\N	474.20	479.10	479.10	460.10	366060	0.00	2026-04-02 09:14:58.358
ELIN	Elin Electronics Limited	NSE	Equities	\N	112.82	105.24	115.40	101.01	213733	0.00	2026-04-02 09:14:58.363
ELLEN	Ellenbarrie Industrial Gases Limited	NSE	Equities	\N	196.92	203.76	202.52	195.56	415932	0.00	2026-04-02 09:14:58.367
EMAMILTD	Emami Limited	NSE	FMCG	\N	393.45	393.45	396.40	385.50	326484	0.00	2026-04-02 09:14:58.369
EMAMIPAP	Emami Paper Mills Limited	NSE	FMCG	\N	63.80	61.68	64.38	60.10	14911	0.00	2026-04-02 09:14:58.372
EMAMIREAL	Emami Realty Limited	NSE	FMCG	\N	58.14	58.24	59.30	57.04	5723	0.00	2026-04-02 09:14:58.375
EMIL	Electronics Mart India Limited	NSE	Equities	\N	92.87	92.79	93.20	89.79	160215	0.00	2026-04-02 09:14:58.381
EMKAY	Emkay Global Financial Services Limited	NSE	Equities	\N	192.84	196.28	200.85	190.43	25909	0.00	2026-04-02 09:14:58.383
EMMBI	Emmbi Industries Limited	NSE	Equities	\N	69.61	66.77	70.63	66.01	8739	0.00	2026-04-02 09:14:58.387
EMMVEE	Emmvee Photovoltaic Power Limited	NSE	Equities	\N	215.85	219.04	218.06	210.05	727832	0.00	2026-04-02 09:15:01.239
EMSLIMITED	EMS Limited	NSE	Equities	\N	282.60	283.55	288.70	272.15	203184	0.00	2026-04-02 09:15:01.243
EMUDHRA	eMudhra Limited	NSE	Equities	\N	410.50	393.25	415.00	376.20	1681712	0.00	2026-04-02 09:15:01.246
ENERGYDEV	Energy Development Company Limited	NSE	Equities	\N	14.20	13.80	14.39	13.53	23322	0.00	2026-04-02 09:15:01.261
ENGINERSIN	Engineers India Limited	NSE	Equities	\N	199.45	200.98	201.88	191.61	3527168	0.00	2026-04-02 09:15:01.263
ENIL	Entertainment Network (India) Limited	NSE	Equities	\N	102.18	103.09	103.00	100.10	10846	0.00	2026-04-02 09:15:01.266
ENRIN	Siemens Energy India Limited	NSE	Equities	\N	2616.80	2613.90	2633.50	2521.70	171507	0.00	2026-04-02 09:15:01.27
ENTERO	Entero Healthcare Solutions Limited	NSE	Healthcare	\N	1241.10	1246.60	1257.90	1207.20	32244	0.00	2026-04-02 09:15:01.272
EPACK	EPACK Durable Limited	NSE	Equities	\N	213.84	217.51	216.98	207.43	456200	0.00	2026-04-02 09:15:01.275
EPIGRAL	Epigral Limited	NSE	Equities	\N	876.20	869.05	883.20	834.10	51337	0.00	2026-04-02 09:15:01.28
EPL	EPL Limited	NSE	Equities	\N	213.75	215.23	217.41	208.17	956220	0.00	2026-04-02 09:15:01.283
EQUITASBNK	Equitas Small Finance Bank Limited	NSE	Banking	\N	53.48	53.49	54.12	51.73	1648813	0.00	2026-04-02 09:15:01.286
ERIS	Eris Lifesciences Limited	NSE	Equities	\N	1315.80	1310.20	1324.00	1280.00	12370	0.00	2026-04-02 09:15:01.289
ESABINDIA	Esab India Limited	NSE	Equities	\N	5200.00	5111.30	5250.00	5000.00	5059	0.00	2026-04-02 09:15:01.291
ESAFSFB	ESAF Small Finance Bank Limited	NSE	Banking	\N	23.40	22.43	23.59	21.72	658190	0.00	2026-04-02 09:15:01.294
ESCORTS	Escorts Kubota Limited	NSE	Equities	\N	2820.90	2827.20	2830.00	2710.10	125881	0.00	2026-04-02 09:15:01.297
ESSARSHPNG	Essar Shipping Limited	NSE	Equities	\N	23.18	23.25	23.25	22.61	122839	0.00	2026-04-02 09:15:01.3
ESSENTIA	Integra Essentia Limited	NSE	Equities	\N	1.21	1.20	1.21	1.11	1490303	0.00	2026-04-02 09:15:01.303
ETERNAL	ETERNAL LIMITED	NSE	Equities	\N	229.26	236.52	232.39	223.74	57533498	0.00	2026-04-02 09:15:01.308
ETHOSLTD	Ethos Limited	NSE	Equities	\N	2215.30	2234.70	2229.00	2145.10	10029	0.00	2026-04-02 09:15:01.311
EUREKAFORB	Eureka Forbes Limited	NSE	Equities	\N	459.10	459.50	460.60	443.20	58120	0.00	2026-04-02 09:15:01.314
EUROBOND	Euro Panel Products Limited	NSE	Equities	\N	147.48	143.31	147.48	140.00	3183	0.00	2026-04-02 09:15:01.317
EUROPRATIK	Euro Pratik Sales Limited	NSE	Equities	\N	222.62	222.62	226.00	214.36	130535	0.00	2026-04-02 09:15:01.32
DSSL	Dynacons Systems & Solutions Limited	NSE	Equities	\N	875.40	864.40	893.00	832.90	22533	0.00	2026-04-02 09:14:58.272
FAZE3Q	Faze Three Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
FEL	Future Enterprises Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
FELDVR	Future Enterprises Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
FIBERWEB	Fiberweb (India) Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
FLFL	Future Lifestyle Fashions Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
EXICOM	Exicom Tele-Systems Limited	NSE	Equities	\N	83.74	83.77	85.00	80.31	516755	0.00	2026-04-02 09:15:01.338
EXIDEIND	Exide Industries Limited	NSE	Equities	\N	296.50	299.85	297.90	289.70	1770996	0.00	2026-04-02 09:15:01.34
EXPLEOSOL	Expleo Solutions Limited	NSE	Equities	\N	722.75	706.85	734.90	690.60	11892	0.00	2026-04-02 09:15:01.343
EXXARO	Exxaro Tiles Limited	NSE	Equities	\N	6.70	6.51	6.74	6.30	146937	0.00	2026-04-02 09:15:01.345
FACT	Fertilizers and Chemicals Travancore Limited	NSE	Chemicals	\N	764.20	785.65	779.35	750.00	193993	0.00	2026-04-02 09:15:01.351
FAIRCHEMOR	Fairchem Organics Limited	NSE	Equities	\N	493.80	471.15	519.00	457.55	18592	0.00	2026-04-02 09:15:01.354
FCL	Fineotex Chemical Limited	NSE	Chemicals	\N	20.94	20.85	21.26	20.05	851171	0.00	2026-04-02 09:15:01.356
FCSSOFT	FCS Software Solutions Limited	NSE	Information Technology	\N	1.35	1.31	1.36	1.24	3086899	0.00	2026-04-02 09:15:01.359
FDC	FDC Limited	NSE	Equities	\N	331.20	328.30	334.95	320.50	73675	0.00	2026-04-02 09:15:01.361
FEDERALBNK	The Federal Bank  Limited	NSE	Banking	\N	262.45	267.60	264.40	256.50	4524881	0.00	2026-04-02 09:15:01.364
FIEMIND	Fiem Industries Limited	NSE	Equities	\N	1964.90	1974.70	1990.00	1903.20	31604	0.00	2026-04-02 09:15:01.369
FILATEX	Filatex India Limited	NSE	Equities	\N	40.00	40.41	40.60	38.85	543585	0.00	2026-04-02 09:15:01.372
FILATFASH	Filatex Fashions Limited	NSE	Equities	\N	0.16	0.15	0.16	0.16	11277312	0.00	2026-04-02 09:15:01.375
FINCABLES	Finolex Cables Limited	NSE	Equities	\N	798.70	798.75	807.65	765.50	235642	0.00	2026-04-02 09:15:01.378
FINEORG	Fine Organic Industries Limited	NSE	Equities	\N	4303.40	4164.20	4378.60	4072.50	30732	0.00	2026-04-02 09:15:01.381
FINKURVE	Finkurve Financial Services Limited	NSE	Equities	\N	55.05	56.35	56.00	53.68	18541	0.00	2026-04-02 09:15:01.383
FINOPB	Fino Payments Bank Limited	NSE	Banking	\N	123.94	124.51	127.62	119.16	495273	0.00	2026-04-02 09:15:01.385
FINPIPE	Finolex Industries Limited	NSE	Equities	\N	157.53	159.05	160.20	152.68	447625	0.00	2026-04-02 09:15:04.243
FIRSTCRY	Brainbees Solutions Limited	NSE	Equities	\N	223.35	220.67	225.11	212.00	1482745	0.00	2026-04-02 09:15:04.247
FIVESTAR	Five-Star Business Finance Limited	NSE	Equities	\N	358.00	360.05	361.75	348.80	725765	0.00	2026-04-02 09:15:04.253
FLAIR	Flair Writing Industries Limited	NSE	Equities	\N	293.25	289.15	295.60	284.05	31220	0.00	2026-04-02 09:15:04.256
FLEXITUFF	Flexituff Ventures International Limited	NSE	Equities	\N	6.49	6.39	6.59	6.30	3485	0.00	2026-04-02 09:15:04.259
FLUOROCHEM	Gujarat Fluorochemicals Limited	NSE	Chemicals	\N	3183.50	3234.80	3213.50	3110.00	26406	0.00	2026-04-02 09:15:04.262
FMGOETZE	Federal-Mogul Goetze (India) Limited.	NSE	Equities	\N	410.00	418.15	413.90	398.90	50245	0.00	2026-04-02 09:15:04.266
FMNL	Future Market Networks Limited	NSE	Equities	\N	7.81	7.44	7.81	7.43	88063	0.00	2026-04-02 09:15:04.269
FOODSIN	Foods & Inns Limited	NSE	Equities	\N	53.65	51.65	55.71	48.62	274788	0.00	2026-04-02 09:15:04.277
FORCEMOT	FORCE MOTORS LTD	NSE	Automobile	\N	20878.00	20733.00	21000.00	20070.00	72370	0.00	2026-04-02 09:15:04.281
FORTIS	Fortis Healthcare Limited	NSE	Healthcare	\N	785.35	795.00	791.00	766.80	1015929	0.00	2026-04-02 09:15:04.283
FOSECOIND	Foseco India Limited	NSE	Equities	\N	4596.10	4620.70	4618.50	4512.00	539	0.00	2026-04-02 09:15:04.286
FRACTAL	Fractal Analytics Limited	NSE	Equities	\N	788.65	798.05	802.75	775.00	132091	0.00	2026-04-02 09:15:04.289
FSL	Firstsource Solutions Limited	NSE	Equities	\N	216.00	214.89	218.20	205.82	824276	0.00	2026-04-02 09:15:04.291
FUSION	Fusion Finance Limited	NSE	Equities	\N	146.00	144.68	147.00	139.02	208915	0.00	2026-04-02 09:15:04.294
GAEL	Gujarat Ambuja Exports Limited	NSE	Equities	\N	138.55	139.37	140.00	134.22	355360	0.00	2026-04-02 09:15:04.301
GAIL	GAIL (India) Limited	NSE	Equities	\N	140.84	140.67	141.30	137.50	11773102	0.00	2026-04-02 09:15:04.305
GALAPREC	Gala Precision Engineering Limited	NSE	Equities	\N	727.10	711.20	734.25	696.00	19928	0.00	2026-04-02 09:15:04.307
GALAXYSURF	Galaxy Surfactants Limited	NSE	Equities	\N	1646.70	1634.10	1666.90	1583.10	8169	0.00	2026-04-02 09:15:04.311
GALLANTT	Gallantt Ispat Limited	NSE	Equities	\N	553.50	562.85	561.00	546.05	23687	0.00	2026-04-02 09:15:04.314
GANDHITUBE	Gandhi Special Tubes Limited	NSE	Equities	\N	810.55	808.10	818.50	788.95	3152	0.00	2026-04-02 09:15:04.321
GANECOS	Ganesha Ecosphere Limited	NSE	Equities	\N	1144.10	1022.20	1178.80	976.55	17006692	0.00	2026-04-02 09:15:04.324
GANESHBE	Ganesh Benzoplast Limited	NSE	Equities	\N	78.35	77.77	78.59	75.12	30739	0.00	2026-04-02 09:15:04.327
GANESHCP	Ganesh Consumer Products Limited	NSE	Consumer Goods	\N	179.50	174.32	182.68	171.00	181345	0.00	2026-04-02 09:15:04.33
GANESHHOU	GANESH HOUSING LIMITED	NSE	Equities	\N	540.75	551.10	548.10	522.60	45580	0.00	2026-04-02 09:15:04.333
GANGAFORGE	Ganga Forging Limited	NSE	Equities	\N	2.63	2.65	2.67	2.50	67280	0.00	2026-04-02 09:15:04.335
GARFIBRES	Garware Technical Fibres Limited	NSE	Information Technology	\N	600.00	598.05	607.90	582.55	45879	0.00	2026-04-02 09:15:04.359
GARUDA	Garuda Construction and Engineering Limited	NSE	Equities	\N	146.33	147.36	152.95	138.35	1120490	0.00	2026-04-02 09:15:04.362
GATECH	GACM Technologies Limited	NSE	Information Technology	\N	0.44	0.42	0.44	0.41	3544674	0.00	2026-04-02 09:15:04.365
GATECHDVR	GACM Technologies Limited	NSE	Information Technology	\N	0.44	0.42	0.44	0.36	382500	0.00	2026-04-02 09:15:04.368
GATEWAY	Gateway Distriparks Limited	NSE	Equities	\N	54.18	52.86	54.63	50.90	699114	0.00	2026-04-02 09:15:04.371
GAUDIUMIVF	Gaudium IVF and Women Health Limited	NSE	Equities	\N	78.89	78.80	81.50	72.73	632318	0.00	2026-04-02 09:15:04.373
GAYAHWS	Gayatri Highways Limited	NSE	Equities	\N	2.12	2.10	2.19	2.00	132076	0.00	2026-04-02 09:15:04.376
GEECEE	GeeCee Ventures Limited	NSE	Equities	\N	236.93	235.85	239.49	225.11	3712	0.00	2026-04-02 09:15:04.381
GEEKAYWIRE	Geekay Wires Limited	NSE	Equities	\N	21.28	20.75	21.50	20.00	295597	0.00	2026-04-02 09:15:04.384
EXCELINDUS	Excel Industries Limited	NSE	Equities	\N	878.60	882.20	889.40	846.70	6562	0.00	2026-04-02 09:15:01.333
EXCELSOFT	Excelsoft Technologies Limited	NSE	Information Technology	\N	74.40	74.67	74.78	71.02	516256	0.00	2026-04-02 09:15:01.336
GEMAROMA	Gem Aromatics Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GENSOL	Gensol Engineering Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GLFL	Gujarat Lease Financing Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GOLDENTOBC	Golden Tobacco Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GOYALALUM	Goyal Aluminiums Limited	NSE	Metals & Mining	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GENUSPOWER	Genus Power Infrastructures Limited	NSE	Equities	\N	230.28	235.00	233.19	220.77	421752	0.00	2026-04-02 09:15:04.397
GEOJITFSL	Geojit Financial Services Limited	NSE	Equities	\N	57.25	57.14	57.79	54.40	400070	0.00	2026-04-02 09:15:04.4
GESHIP	The Great Eastern Shipping Company Limited	NSE	Equities	\N	1435.50	1460.10	1455.00	1418.70	230605	0.00	2026-04-02 09:15:04.403
GFLLIMITED	GFL Limited	NSE	Equities	\N	40.20	39.18	40.93	38.21	77128	0.00	2026-04-02 09:15:04.406
GHCLTEXTIL	GHCL Textiles Limited	NSE	Textile	\N	71.68	70.38	73.55	68.04	132916	0.00	2026-04-02 09:15:04.413
GICHSGFIN	GIC Housing Finance Limited	NSE	Equities	\N	141.41	139.31	142.26	135.78	40240	0.00	2026-04-02 09:15:07.245
GICL	Globe International Carriers Limited	NSE	Equities	\N	40.94	40.71	41.00	39.01	777554	0.00	2026-04-02 09:15:07.248
GILLETTE	Gillette India Limited	NSE	Equities	\N	7423.00	7538.00	7507.50	7288.50	16664	0.00	2026-04-02 09:15:07.257
GINNIFILA	Ginni Filaments Limited	NSE	Equities	\N	36.48	35.32	36.50	34.32	23228	0.00	2026-04-02 09:15:07.262
GIPCL	Gujarat Industries Power Company Limited	NSE	Equities	\N	128.60	129.45	130.75	124.80	144257	0.00	2026-04-02 09:15:07.267
GKENERGY	GK Energy Limited	NSE	Equities	\N	90.97	90.84	92.00	87.20	433543	0.00	2026-04-02 09:15:07.27
GKSL	Gujarat Kidney And Super Speciality Limited	NSE	Equities	\N	103.99	103.31	105.40	101.99	170224	0.00	2026-04-02 09:15:07.272
GKWLIMITED	GKW Limited	NSE	Equities	\N	1476.00	1494.10	1476.00	1452.60	377	0.00	2026-04-02 09:15:07.275
GLAND	Gland Pharma Limited	NSE	Pharmaceuticals	\N	1684.60	1706.00	1706.60	1652.00	72131	0.00	2026-04-02 09:15:07.28
GLENMARK	Glenmark Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	2075.20	2101.10	2089.00	1966.50	876363	0.00	2026-04-02 09:15:07.432
GLOBAL	Global Education Limited	NSE	Equities	\N	99.55	95.75	102.00	94.81	83934	0.00	2026-04-02 09:15:07.436
GLOBALE	Globale Tessile Limited	NSE	Equities	\N	10.18	10.19	10.24	9.80	1576	0.00	2026-04-02 09:15:07.439
GLOBALVECT	Global Vectra Helicorp Limited	NSE	Equities	\N	154.77	150.58	156.60	144.00	6450	0.00	2026-04-02 09:15:07.445
GLOBE	GLOBE ENTERPRISES (INDIA) LIMITED	NSE	Equities	\N	2.18	2.14	2.25	2.02	374932	0.00	2026-04-02 09:15:07.45
GLOBECIVIL	Globe Civil Projects Limited	NSE	Equities	\N	38.79	36.84	39.98	35.31	201154	0.00	2026-04-02 09:15:07.458
GLOBUSSPR	Globus Spirits Limited	NSE	Equities	\N	862.10	852.90	873.45	822.55	47038	0.00	2026-04-02 09:15:07.462
GLOSTERLTD	Gloster Limited	NSE	Equities	\N	535.90	538.20	538.20	520.70	635	0.00	2026-04-02 09:15:07.465
GMBREW	GM Breweries Limited	NSE	Equities	\N	1039.40	1048.90	1057.40	1001.00	76066	0.00	2026-04-02 09:15:07.47
GMDCLTD	Gujarat Mineral Development Corporation Limited	NSE	Metals & Mining	\N	577.15	580.30	584.20	565.15	1912407	0.00	2026-04-02 09:15:07.473
GMMPFAUDLR	GMM Pfaudler Limited	NSE	Equities	\N	846.65	843.65	859.00	811.55	38680	0.00	2026-04-02 09:15:07.475
GMRAIRPORT	GMR AIRPORTS LIMITED	NSE	Equities	\N	87.92	89.29	88.40	85.71	6344686	0.00	2026-04-02 09:15:07.478
GMRP&UI	GMR Power and Urban Infra Limited	NSE	Equities	\N	97.85	98.35	99.61	93.49	849955	0.00	2026-04-02 09:15:07.481
GNA	GNA Axles Limited	NSE	Equities	\N	370.00	378.45	375.45	359.10	31536	0.00	2026-04-02 09:15:07.485
GOACARBON	Goa Carbon Limited	NSE	Equities	\N	301.60	294.10	306.00	285.00	22905	0.00	2026-04-02 09:15:07.49
GOCLCORP	GOCL Corporation Limited	NSE	Equities	\N	266.95	269.65	269.40	259.00	59112	0.00	2026-04-02 09:15:07.493
GOCOLORS	Go Fashion (India) Limited	NSE	Equities	\N	270.99	266.69	277.34	257.82	191345	0.00	2026-04-02 09:15:07.496
GODAVARIB	Godavari Biorefineries Limited	NSE	Equities	\N	311.00	314.05	314.10	305.80	113265	0.00	2026-04-02 09:15:07.499
GODFRYPHLP	Godfrey Phillips India Limited	NSE	Equities	\N	1898.70	1927.30	1920.00	1866.50	595066	0.00	2026-04-02 09:15:07.502
GODIGIT	Go Digit General Insurance Limited	NSE	Financial Services	\N	318.80	319.90	319.90	312.85	159103	0.00	2026-04-02 09:15:07.505
GODREJAGRO	Godrej Agrovet Limited	NSE	Equities	\N	564.05	571.10	570.20	551.90	65484	0.00	2026-04-02 09:15:07.509
GODREJIND	Godrej Industries Limited	NSE	Equities	\N	828.60	831.85	839.60	793.10	223564	0.00	2026-04-02 09:15:07.515
GODREJPROP	Godrej Properties Limited	NSE	Equities	\N	1483.30	1508.10	1496.80	1434.00	1022414	0.00	2026-04-02 09:15:07.517
GOKEX	Gokaldas Exports Limited	NSE	Equities	\N	598.50	618.80	608.70	588.00	480113	0.00	2026-04-02 09:15:07.52
GOKUL	Gokul Refoils and Solvent Limited	NSE	Equities	\N	37.91	37.79	38.49	35.80	16477	0.00	2026-04-02 09:15:07.525
GOKULAGRO	Gokul Agro Resources Limited	NSE	Equities	\N	192.20	190.94	194.87	184.69	553030	0.00	2026-04-02 09:15:07.529
GOLDTECH	AION-TECH SOLUTIONS LIMITED	NSE	Information Technology	\N	35.07	34.17	35.63	33.03	33946	0.00	2026-04-02 09:15:07.537
GOPAL	Gopal Snacks Limited	NSE	Equities	\N	259.50	265.40	264.90	258.00	76978	0.00	2026-04-02 09:15:07.543
GPIL	Godawari Power And Ispat limited	NSE	Equities	\N	276.25	278.65	279.85	268.00	2248486	0.00	2026-04-02 09:15:07.546
GPPL	Gujarat Pipavav Port Limited	NSE	Equities	\N	144.56	146.69	145.70	141.75	923217	0.00	2026-04-02 09:15:07.549
GPTHEALTH	GPT Healthcare Limited	NSE	Healthcare	\N	122.51	119.13	124.83	116.00	76645	0.00	2026-04-02 09:15:07.554
GRANULES	Granules India Limited	NSE	Equities	\N	615.45	628.10	622.00	602.20	366072	0.00	2026-04-02 09:15:07.562
GRAPHITE	Graphite India Limited	NSE	Equities	\N	633.40	643.20	639.70	618.35	693407	0.00	2026-04-02 09:15:10.241
GRASIM	Grasim Industries Limited	NSE	Equities	\N	2554.00	2592.80	2574.90	2514.20	397584	0.00	2026-04-02 09:15:10.247
GRAVITA	Gravita India Limited	NSE	Equities	\N	1284.70	1318.30	1303.90	1266.90	404749	0.00	2026-04-02 09:15:10.251
GREAVESCOT	Greaves Cotton Limited	NSE	Textile	\N	130.37	131.34	131.93	125.01	865637	0.00	2026-04-02 09:15:10.26
GENESYS	Genesys International Corporation Limited	NSE	Equities	\N	233.00	238.60	238.39	223.50	497164	0.00	2026-04-02 09:15:04.391
GENUSPAPER	Genus Paper & Boards Limited	NSE	Equities	\N	10.45	10.36	10.68	9.60	102336	0.00	2026-04-02 09:15:04.393
GOODLUCK	Goodluck India Limited	NSE	Equities	\N	1038.75	1036.80	1048.35	995.50	40335	0.00	2026-04-02 09:15:07.54
GVKPIL	GVK Power & Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
GVPIL	GE Power India Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
HARDWYN	Hardwyn India Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.51412
HDFCAMC	HDFC Asset Management Company Limited	NSE	Financial Services	\N	2332.80	2340.50	2345.20	2241.20	944160	0.00	2026-04-02 09:15:13.254
HDIL	Housing Development and Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
GREENPANEL	Greenpanel Industries Limited	NSE	Equities	\N	180.35	179.73	183.38	173.80	51709	0.00	2026-04-02 09:15:10.266
GREENPLY	Greenply Industries Limited	NSE	Equities	\N	193.44	187.63	194.43	181.20	186348	0.00	2026-04-02 09:15:10.269
GRINDWELL	Grindwell Norton Limited	NSE	Equities	\N	1384.50	1405.40	1400.00	1355.50	17160	0.00	2026-04-02 09:15:10.276
GRINFRA	G R Infraprojects Limited	NSE	Equities	\N	826.30	838.70	836.90	800.40	78160	0.00	2026-04-02 09:15:10.282
GRMOVER	GRM Overseas Limited	NSE	Equities	\N	155.34	155.10	157.00	152.22	1664726	0.00	2026-04-02 09:15:10.286
GROBTEA	The Grob Tea Company Limited	NSE	Equities	\N	850.00	847.25	860.00	822.40	169	0.00	2026-04-02 09:15:10.289
GROWW	Billionbrains Garage Ventures Limited	NSE	Equities	\N	163.34	161.55	164.86	156.50	19576276	0.00	2026-04-02 09:15:10.292
GRPLTD	GRP Limited	NSE	Equities	\N	1900.00	1888.60	1900.00	1868.00	1950	0.00	2026-04-02 09:15:10.295
GRWRHITECH	Garware Hi-Tech Films Limited	NSE	Information Technology	\N	3650.00	3623.50	3689.90	3490.00	25630	0.00	2026-04-02 09:15:10.306
GSFC	Gujarat State Fertilizers & Chemicals Limited	NSE	Chemicals	\N	150.08	148.42	151.48	143.36	934421	0.00	2026-04-02 09:15:10.309
GSLSU	Global Surfaces Limited	NSE	Equities	\N	48.47	46.58	48.90	44.31	131300	0.00	2026-04-02 09:15:10.312
GSPCROP	GSP Crop Science Limited	NSE	Equities	\N	370.80	390.90	385.00	370.00	325832	0.00	2026-04-02 09:15:10.316
GSPL	Gujarat State Petronet Limited	NSE	Equities	\N	236.28	234.38	237.74	228.50	581469	0.00	2026-04-02 09:15:10.319
GSS	GSS Infotech Limited	NSE	Information Technology	\N	11.97	10.30	11.99	9.81	96038	0.00	2026-04-02 09:15:10.323
GTECJAINX	G-TEC JAINX EDUCATION LIMITED	NSE	Equities	\N	19.00	18.05	19.25	17.56	269	0.00	2026-04-02 09:15:10.325
GTL	GTL Limited	NSE	Equities	\N	5.96	6.08	6.00	5.74	439256	0.00	2026-04-02 09:15:10.328
GTPL	GTPL Hathway Limited	NSE	Equities	\N	59.80	59.06	60.90	57.54	39117	0.00	2026-04-02 09:15:10.336
GUFICBIO	Gufic Biosciences Limited	NSE	Equities	\N	288.55	288.70	290.70	279.30	12680	0.00	2026-04-02 09:15:10.339
GUJALKALI	Gujarat Alkalies and Chemicals Limited	NSE	Chemicals	\N	595.50	591.30	600.00	578.15	5321847	0.00	2026-04-02 09:15:10.344
GUJAPOLLO	Gujarat Apollo Industries Limited	NSE	Equities	\N	417.05	403.70	423.10	395.05	8180	0.00	2026-04-02 09:15:10.348
GUJGASLTD	Gujarat Gas Limited	NSE	Equities	\N	307.15	311.20	310.80	301.50	939628	0.00	2026-04-02 09:15:10.351
GUJTHEM	Gujarat Themis Biosyn Limited	NSE	Equities	\N	249.12	247.02	254.08	235.50	52191	0.00	2026-04-02 09:15:10.366
GULFOILLUB	Gulf Oil Lubricants India Limited	NSE	Equities	\N	883.60	896.45	891.00	866.15	69124	0.00	2026-04-02 09:15:10.369
GULFPETRO	GP Petroleums Limited	NSE	Energy	\N	27.01	25.88	27.27	25.12	40635	0.00	2026-04-02 09:15:10.373
GULPOLY	Gulshan Polyols Limited	NSE	Equities	\N	148.64	148.62	150.90	145.18	112870	0.00	2026-04-02 09:15:10.376
GVPTECH	GVP Infotech Limited	NSE	Information Technology	\N	6.17	6.18	6.35	6.00	43887	0.00	2026-04-02 09:15:10.38
GVT&D	GE Vernova T&D India Limited	NSE	Equities	\N	3790.10	3798.70	3847.90	3674.70	569430	0.00	2026-04-02 09:15:10.383
HALDER	Halder Venture Limited	NSE	Equities	\N	255.00	242.86	255.00	248.00	86	0.00	2026-04-02 09:15:10.39
HALEOSLABS	HALEOS LABS LIMITED	NSE	Equities	\N	1289.90	1253.80	1289.90	1197.60	505	0.00	2026-04-02 09:15:10.393
HAPPSTMNDS	Happiest Minds Technologies Limited	NSE	Information Technology	\N	391.15	392.75	397.65	375.00	1083108	0.00	2026-04-02 09:15:10.397
HAPPYFORGE	Happy Forgings Limited	NSE	Equities	\N	1169.50	1185.10	1185.60	1135.00	20760	0.00	2026-04-02 09:15:10.4
HARIOMPIPE	Hariom Pipe Industries Limited	NSE	Equities	\N	305.60	304.10	311.25	291.50	95257	0.00	2026-04-02 09:15:10.403
HARRMALAYA	Harrisons  Malayalam Limited	NSE	Equities	\N	178.00	177.57	180.00	173.12	12841	0.00	2026-04-02 09:15:10.407
HATHWAY	Hathway Cable & Datacom Limited	NSE	Equities	\N	9.65	9.68	9.79	9.30	2115416	0.00	2026-04-02 09:15:10.413
HATSUN	Hatsun Agro Product Limited	NSE	Equities	\N	898.75	896.85	904.00	878.55	24029	0.00	2026-04-02 09:15:10.416
HAVELLS	Havells India Limited	NSE	Equities	\N	1170.30	1185.90	1177.10	1142.50	689373	0.00	2026-04-02 09:15:10.42
HAVISHA	Sri Havisha Hospitality and Infrastructure Limited	NSE	Healthcare	\N	1.27	1.23	1.27	1.20	27149	0.00	2026-04-02 09:15:10.423
HBLENGINE	HBL Engineering Limited	NSE	Equities	\N	654.80	660.30	668.80	629.10	1198478	0.00	2026-04-02 09:15:10.427
HBSL	HB Stockholdings Limited	NSE	Equities	\N	45.77	44.14	45.99	44.13	2041	0.00	2026-04-02 09:15:10.43
HCG	Healthcare Global Enterprises Limited	NSE	Healthcare	\N	528.05	535.15	533.90	518.20	54161	0.00	2026-04-02 09:15:13.24
HCL-INSYS	HCL Infosystems Limited	NSE	Information Technology	\N	11.52	10.61	11.94	9.85	386344	0.00	2026-04-02 09:15:13.245
HCLTECH	HCL Technologies Limited	NSE	Information Technology	\N	1406.50	1354.40	1412.80	1341.20	4736502	0.00	2026-04-02 09:15:13.248
HDBFS	HDB Financial Services Limited	NSE	Equities	\N	577.55	576.65	580.70	560.05	188617	0.00	2026-04-02 09:15:13.251
HDFCLIFE	HDFC Life Insurance Company Limited	NSE	Financial Services	\N	565.55	572.95	568.90	555.10	4058160	0.00	2026-04-02 09:15:13.26
HEADSUP	Heads UP Ventures Limited	NSE	Equities	\N	6.76	6.92	7.50	6.60	21374	0.00	2026-04-02 09:15:13.263
HECPROJECT	HEC Infra Projects Limited	NSE	Equities	\N	99.26	99.36	100.89	97.00	2375	0.00	2026-04-02 09:15:13.266
HEG	HEG Limited	NSE	Equities	\N	547.65	564.15	558.95	540.50	1256747	0.00	2026-04-02 09:15:13.269
HEMIPROP	Hemisphere Properties India Limited	NSE	Equities	\N	116.21	119.32	118.06	114.50	565285	0.00	2026-04-02 09:15:13.274
HERANBA	Heranba Industries Limited	NSE	Equities	\N	175.53	173.81	178.12	168.69	56105	0.00	2026-04-02 09:15:13.277
HERITGFOOD	Heritage Foods Limited	NSE	Equities	\N	308.85	307.70	312.80	299.35	224102	0.00	2026-04-02 09:15:13.28
HEROMOTOCO	Hero MotoCorp Limited	NSE	Equities	\N	4983.00	5122.00	5077.00	4904.00	552101	0.00	2026-04-02 09:15:13.282
HESTERBIO	Hester Biosciences Limited	NSE	Equities	\N	1401.20	1365.60	1427.90	1332.40	2414	0.00	2026-04-02 09:15:13.286
HEXATRADEX	Hexa Tradex Limited	NSE	Equities	\N	159.70	158.76	161.00	155.33	652	0.00	2026-04-02 09:15:13.288
ICICIBANK	ICICI Bank Limited	NSE	Banking	\N	1205.00	1212.70	1211.60	1187.60	12350507	0.00	2026-04-02 09:15:16.298
HITECHGEAR	The Hi-Tech Gears Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
HMT	HMT Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
ICDSLTD	ICDS Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
HFCL	HFCL Limited	NSE	Equities	\N	70.92	72.47	72.25	69.68	11673001	0.00	2026-04-02 09:15:13.296
HGINFRA	H.G. Infra Engineering Limited	NSE	Equities	\N	474.70	477.55	482.70	456.10	135691	0.00	2026-04-02 09:15:13.298
HGM	HandsOn Global Management (HGM) Limited	NSE	Equities	\N	48.58	47.78	49.50	47.02	2245	0.00	2026-04-02 09:15:13.302
HGS	Hinduja Global Solutions Limited	NSE	Equities	\N	361.50	367.65	370.45	359.50	24067	0.00	2026-04-02 09:15:13.305
HIKAL	Hikal Limited	NSE	Equities	\N	158.66	159.96	162.00	152.04	241984	0.00	2026-04-02 09:15:13.308
HILINFRA	Highway Infrastructure Limited	NSE	Equities	\N	45.95	46.29	46.52	44.15	98515	0.00	2026-04-02 09:15:13.311
HILTON	Hilton Metal Forging Limited	NSE	Equities	\N	22.00	23.81	23.00	21.67	934714	0.00	2026-04-02 09:15:13.314
HINDALCO	Hindalco Industries Limited	NSE	Equities	\N	913.25	904.60	919.75	884.80	6227746	0.00	2026-04-02 09:15:13.319
HINDCOMPOS	Hindustan Composites Limited	NSE	Equities	\N	365.65	367.30	366.95	358.60	1260	0.00	2026-04-02 09:15:13.322
HINDCON	Hindcon Chemicals Limited	NSE	Chemicals	\N	17.91	17.44	18.30	17.35	16062	0.00	2026-04-02 09:15:13.325
HINDCOPPER	Hindustan Copper Limited	NSE	Equities	\N	489.80	496.00	499.45	468.20	15606371	0.00	2026-04-02 09:15:13.33
HINDOILEXP	Hindustan Oil Exploration Company Limited	NSE	Equities	\N	123.14	122.53	124.40	119.39	554496	0.00	2026-04-02 09:15:13.333
HINDWAREAP	Hindware Home Innovation Limited	NSE	Equities	\N	193.00	193.00	195.89	183.01	91708	0.00	2026-04-02 09:15:13.343
HINDZINC	Hindustan Zinc Limited	NSE	Equities	\N	511.70	524.45	517.70	503.35	3497045	0.00	2026-04-02 09:15:13.347
HIRECT	Hind Rectifiers Limited	NSE	Equities	\N	686.85	702.50	694.10	643.70	91104	0.00	2026-04-02 09:15:13.35
HISARMETAL	Hisar Metal Industries Limited	NSE	Equities	\N	139.00	141.68	142.99	137.11	3363	0.00	2026-04-02 09:15:13.354
HITECH	Hi-Tech Pipes Limited	NSE	Information Technology	\N	76.00	76.27	77.50	73.25	437679	0.00	2026-04-02 09:15:13.357
HITECHCORP	Hitech Corporation Limited	NSE	Information Technology	\N	133.53	127.10	133.71	121.81	6007	0.00	2026-04-02 09:15:13.363
HLEGLAS	HLE Glascoat Limited	NSE	Equities	\N	265.95	269.20	268.80	256.35	276908	0.00	2026-04-02 09:15:13.366
HLVLTD	HLV LIMITED	NSE	Equities	\N	7.70	6.43	7.71	6.11	1597578	0.00	2026-04-02 09:15:13.368
HMVL	Hindustan Media Ventures Limited	NSE	Equities	\N	61.00	62.57	62.08	60.31	16982	0.00	2026-04-02 09:15:13.373
HNDFDS	Hindustan Foods Limited	NSE	Equities	\N	488.85	493.85	495.10	481.00	19176	0.00	2026-04-02 09:15:13.376
HOMEFIRST	Home First Finance Company India Limited	NSE	Equities	\N	949.70	950.45	954.90	921.35	211019	0.00	2026-04-02 09:15:13.378
HONASA	Honasa Consumer Limited	NSE	Consumer Goods	\N	302.65	307.45	305.00	295.00	568434	0.00	2026-04-02 09:15:13.382
HONAUT	Honeywell Automation India Limited	NSE	Equities	\N	26660.00	27290.00	27085.00	26545.00	5070	0.00	2026-04-02 09:15:13.386
HPAL	HP Adhesives Limited	NSE	Equities	\N	30.91	29.33	31.45	28.38	105841	0.00	2026-04-02 09:15:13.39
HPIL	Hindprakash Industries Limited	NSE	Equities	\N	115.21	117.36	118.49	111.01	982	0.00	2026-04-02 09:15:16.253
HPL	HPL Electric & Power Limited	NSE	Equities	\N	293.45	294.45	299.30	279.55	395966	0.00	2026-04-02 09:15:16.257
HSCL	Himadri Speciality Chemical Limited	NSE	Chemicals	\N	439.55	446.85	446.80	427.80	3503910	0.00	2026-04-02 09:15:16.26
HTMEDIA	HT Media Limited	NSE	Equities	\N	20.86	20.69	20.87	20.08	36101	0.00	2026-04-02 09:15:16.265
HUBTOWN	Hubtown Limited	NSE	Equities	\N	182.90	186.31	185.12	179.00	266837	0.00	2026-04-02 09:15:16.268
HUHTAMAKI	Huhtamaki India Limited	NSE	Equities	\N	162.65	161.45	164.38	156.10	56735	0.00	2026-04-02 09:15:16.274
HYBRIDFIN	Hybrid Financial Services Limited	NSE	Equities	\N	17.39	16.35	17.60	16.00	5128	0.00	2026-04-02 09:15:16.277
HYUNDAI	Hyundai Motor India Limited	NSE	Automobile	\N	1702.50	1716.20	1716.00	1660.10	1029505	0.00	2026-04-02 09:15:16.281
IBULLSLTD	Indiabulls Limited	NSE	Equities	\N	10.22	10.03	10.42	9.61	3783854	0.00	2026-04-02 09:15:16.284
ICEMAKE	Ice Make Refrigeration Limited	NSE	Equities	\N	707.85	684.15	709.25	670.10	25787	0.00	2026-04-02 09:15:16.288
ICICIAMC	ICICI Prudential Asset Management Company Limited	NSE	Financial Services	\N	2844.00	2857.00	2871.50	2742.00	433318	0.00	2026-04-02 09:15:16.292
ICICIPRULI	ICICI Prudential Life Insurance Company Limited	NSE	Financial Services	\N	498.80	513.35	508.95	491.45	1147323	0.00	2026-04-02 09:15:16.312
ICIL	Indo Count Industries Limited	NSE	Equities	\N	244.05	246.38	247.88	238.15	188201	0.00	2026-04-02 09:15:16.316
ICRA	ICRA Limited	NSE	Equities	\N	5084.00	5086.00	5121.50	4965.50	3185	0.00	2026-04-02 09:15:16.322
IDBI	IDBI Bank Limited	NSE	Banking	\N	68.68	67.65	69.60	65.27	24319952	0.00	2026-04-02 09:15:16.326
IDEA	Vodafone Idea Limited	NSE	Telecom	\N	8.46	8.64	8.63	8.13	631629733	0.00	2026-04-02 09:15:16.331
IDEAFORGE	Ideaforge Technology Limited	NSE	Information Technology	\N	392.45	392.45	399.00	379.10	335226	0.00	2026-04-02 09:15:16.334
IDFCFIRSTB	IDFC First Bank Limited	NSE	Banking	\N	59.49	60.18	59.98	58.08	21238716	0.00	2026-04-02 09:15:16.341
IEX	Indian Energy Exchange Limited	NSE	Equities	\N	118.57	119.95	119.80	116.00	3153535	0.00	2026-04-02 09:15:16.343
IFBAGRO	IFB Agro Industries Limited	NSE	Equities	\N	757.20	721.15	757.20	701.00	19760	0.00	2026-04-02 09:15:16.347
IFBIND	IFB Industries Limited	NSE	Equities	\N	949.85	955.20	960.00	911.10	31790	0.00	2026-04-02 09:15:16.35
IFGLEXPOR	IFGL Refractories Limited	NSE	Equities	\N	136.16	131.56	141.00	127.67	24520	0.00	2026-04-02 09:15:16.359
IGARASHI	Igarashi Motors India Limited	NSE	Automobile	\N	295.00	294.50	298.80	281.00	32479	0.00	2026-04-02 09:15:16.363
IGCL	Indogulf Cropsciences Limited	NSE	Equities	\N	62.91	62.41	64.70	60.29	58008	0.00	2026-04-02 09:15:16.367
IGL	Indraprastha Gas Limited	NSE	Equities	\N	144.68	148.17	147.00	141.74	1877297	0.00	2026-04-02 09:15:16.374
IGPL	IG Petrochemicals Limited	NSE	Chemicals	\N	349.05	364.05	359.75	348.10	32746	0.00	2026-04-02 09:15:16.377
IIFL	IIFL Finance Limited	NSE	Equities	\N	428.25	437.75	435.00	421.05	682737	0.00	2026-04-02 09:15:16.381
IIFLCAPS	IIFL Capital Services Limited	NSE	Equities	\N	256.93	260.72	261.11	247.93	220323	0.00	2026-04-02 09:15:16.386
IITL	Industrial Investment Trust Limited	NSE	Equities	\N	134.95	130.30	135.00	130.00	18120	0.00	2026-04-02 09:15:16.39
IL&FSENGG	IL&FS Engineering and Construction Company Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
IL&FSTRANS	IL&FS Transportation Networks Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
IMPEXFERRO	Impex Ferro Tech Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
INSPIRISYS	Inspirisys Solutions Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
IMFA	Indian Metals & Ferro Alloys Limited	NSE	Equities	\N	1238.90	1231.80	1259.00	1190.30	98612	0.00	2026-04-02 09:15:16.408
IMPAL	India Motor Parts and Accessories Limited	NSE	Automobile	\N	965.20	975.55	974.55	957.80	705	0.00	2026-04-02 09:15:16.411
INA	Insolation Energy Limited	NSE	Equities	\N	91.40	89.68	91.79	85.30	307487	0.00	2026-04-02 09:15:16.415
INCREDIBLE	INCREDIBLE INDUSTRIES LIMITED	NSE	Equities	\N	31.87	29.89	31.89	29.66	1905	0.00	2026-04-02 09:15:16.418
INDBANK	Indbank Merchant Banking Services Limited	NSE	Banking	\N	31.44	31.14	31.69	30.66	24473	0.00	2026-04-02 09:15:16.422
INDGN	Indegene Limited	NSE	Equities	\N	464.40	464.55	473.00	448.15	136875	0.00	2026-04-02 09:15:16.425
INDIACEM	The India Cements Limited	NSE	Equities	\N	356.05	357.20	357.15	347.50	152689	0.00	2026-04-02 09:15:16.433
INDIAGLYCO	India Glycols Limited	NSE	Equities	\N	889.00	883.30	905.00	850.65	108423	0.00	2026-04-02 09:15:16.437
INDIAMART	Indiamart Intermesh Limited	NSE	Equities	\N	2020.00	2038.80	2037.70	1984.20	72856	0.00	2026-04-02 09:15:16.441
INDIANB	Indian Bank	NSE	Banking	\N	862.85	888.00	870.95	844.00	1313490	0.00	2026-04-02 09:15:16.447
INDIANCARD	Indian Card Clothing Company Limited	NSE	Equities	\N	170.01	167.20	175.97	167.20	4935	0.00	2026-04-02 09:15:16.45
INDIANHUME	Indian Hume Pipe Company Limited	NSE	Equities	\N	312.75	307.20	317.00	302.10	22310	0.00	2026-04-02 09:15:16.457
INDIGO	InterGlobe Aviation Limited	NSE	Equities	\N	4147.80	4180.80	4177.40	3970.00	1724908	0.00	2026-04-02 09:15:19.253
INDIGOPNTS	Indigo Paints Limited	NSE	Chemicals	\N	764.10	749.55	772.85	720.50	97292	0.00	2026-04-02 09:15:19.257
INDIQUBE	Indiqube Spaces Limited	NSE	Equities	\N	139.26	137.58	140.99	135.01	14526	0.00	2026-04-02 09:15:19.26
INDNIPPON	India Nippon Electricals Limited	NSE	Equities	\N	705.35	717.25	720.00	685.50	16730	0.00	2026-04-02 09:15:19.263
INDOAMIN	Indo Amines Limited	NSE	Equities	\N	95.43	94.13	97.06	88.67	78921	0.00	2026-04-02 09:15:19.266
INDOBORAX	Indo Borax & Chemicals Limited	NSE	Chemicals	\N	246.00	244.04	249.80	243.35	79059	0.00	2026-04-02 09:15:19.268
INDOCO	Indoco Remedies Limited	NSE	Equities	\N	188.13	187.08	188.80	180.30	13003	0.00	2026-04-02 09:15:19.271
INDORAMA	Indo Rama Synthetics (India) Limited	NSE	Equities	\N	32.41	32.63	32.91	31.60	82135	0.00	2026-04-02 09:15:19.277
INDOSTAR	IndoStar Capital Finance Limited	NSE	Equities	\N	193.36	195.14	195.99	189.00	58823	0.00	2026-04-02 09:15:19.281
INDOTECH	Indo Tech Transformers Limited	NSE	Information Technology	\N	1237.40	1268.40	1249.00	1196.30	18513	0.00	2026-04-02 09:15:19.283
INDOTHAI	Indo Thai Securities Limited	NSE	Equities	\N	292.05	295.40	295.90	286.25	841522	0.00	2026-04-02 09:15:19.286
INDOUS	Indo Us Biotech Limited	NSE	Information Technology	\N	104.17	101.76	105.00	99.13	21752	0.00	2026-04-02 09:15:19.289
INDOWIND	Indowind Energy Limited	NSE	Equities	\N	7.57	7.19	7.95	7.16	853753	0.00	2026-04-02 09:15:19.293
INDSWFTLAB	Ind-Swift Laboratories Limited	NSE	Equities	\N	137.85	138.17	139.30	133.25	123430	0.00	2026-04-02 09:15:19.3
INDTERRAIN	Indian Terrain Fashions Limited	NSE	Equities	\N	28.43	27.96	28.50	26.80	5767	0.00	2026-04-02 09:15:19.305
INDUSINDBK	IndusInd Bank Limited	NSE	Banking	\N	771.50	785.65	778.75	754.00	2020109	0.00	2026-04-02 09:15:19.308
INDUSTOWER	Indus Towers Limited	NSE	Telecom	\N	418.65	423.25	420.10	409.55	2414778	0.00	2026-04-02 09:15:19.311
INFOBEAN	InfoBeans Technologies Limited	NSE	Information Technology	\N	140.46	136.11	143.95	132.41	1332689	0.00	2026-04-02 09:15:19.315
INFOMEDIA	Infomedia Press Limited	NSE	Equities	\N	5.20	4.99	5.20	4.71	11892	0.00	2026-04-02 09:15:19.317
INNOVACAP	Innova Captab Limited	NSE	Equities	\N	705.20	703.95	711.35	686.15	7931	0.00	2026-04-02 09:15:19.329
INNOVANA	Innovana Thinklabs Limited	NSE	Equities	\N	358.10	350.20	361.40	335.40	11992	0.00	2026-04-02 09:15:19.332
INNOVISION	Innovision Limited	NSE	Equities	\N	331.20	335.55	339.15	320.00	99697	0.00	2026-04-02 09:15:19.336
INOXGREEN	Inox Green Energy Services Limited	NSE	Energy	\N	142.35	144.39	144.84	135.80	1019111	0.00	2026-04-02 09:15:19.339
INOXINDIA	INOX India Limited	NSE	Equities	\N	1235.00	1245.10	1245.00	1209.00	49181	0.00	2026-04-02 09:15:19.342
INOXWIND	Inox Wind Limited	NSE	Equities	\N	78.20	80.53	79.14	76.78	8453916	0.00	2026-04-02 09:15:19.346
INTELLECT	Intellect Design Arena Limited	NSE	Equities	\N	653.10	635.90	663.40	616.20	217875	0.00	2026-04-02 09:15:19.352
INTENTECH	Intense Technologies Limited	NSE	Information Technology	\N	95.60	84.14	97.00	83.01	243935	0.00	2026-04-02 09:15:19.36
INTERARCH	Interarch Building Solutions Limited	NSE	Equities	\N	1765.30	1778.00	1782.90	1706.90	52469	0.00	2026-04-02 09:15:19.362
INTLCONV	International Conveyors Limited	NSE	Equities	\N	65.64	64.32	67.46	62.55	87751	0.00	2026-04-02 09:15:19.365
INVENTURE	Inventure Growth & Securities Limited	NSE	Equities	\N	0.95	0.90	0.96	0.87	793195	0.00	2026-04-02 09:15:19.369
IOB	Indian Overseas Bank	NSE	Banking	\N	32.53	32.41	32.75	31.41	3791703	0.00	2026-04-02 09:15:19.372
IOC	Indian Oil Corporation Limited	NSE	Equities	\N	133.01	135.72	134.20	130.22	17487493	0.00	2026-04-02 09:15:19.375
IONEXCHANG	ION Exchange (India) Limited	NSE	Equities	\N	339.25	337.30	344.30	325.85	123164	0.00	2026-04-02 09:15:19.381
IPCALAB	IPCA Laboratories Limited	NSE	Equities	\N	1488.40	1508.20	1509.00	1432.50	173263	0.00	2026-04-02 09:15:19.385
IPL	India Pesticides Limited	NSE	Chemicals	\N	136.40	135.21	138.40	130.00	169046	0.00	2026-04-02 09:15:19.388
IRB	IRB Infrastructure Developers Limited	NSE	Equities	\N	21.48	21.61	21.80	20.72	9612513	0.00	2026-04-02 09:15:19.391
IRCON	Ircon International Limited	NSE	Equities	\N	123.41	125.40	124.80	118.79	2988768	0.00	2026-04-02 09:15:19.393
IREDA	Indian Renewable Energy Development Agency Limited	NSE	Equities	\N	113.52	113.76	114.90	109.85	7308908	0.00	2026-04-02 09:15:19.4
IRFC	Indian Railway Finance Corporation Limited	NSE	Equities	\N	90.60	91.99	91.55	88.60	15778827	0.00	2026-04-02 09:15:19.404
IKIO	IKIO Technologies Limited	NSE	Information Technology	\N	118.01	114.07	120.00	111.00	104419	0.00	2026-04-02 09:15:16.395
IMAGICAA	Imagicaaworld Entertainment Limited	NSE	Equities	\N	41.60	40.71	42.01	39.80	483519	0.00	2026-04-02 09:15:16.403
IZMO	IZMO Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.529992
JITFINFRA	JITF Infralogistics Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
IRIS	IRIS RegTech Solutions Limited	NSE	Information Technology	\N	224.00	217.04	227.48	214.99	13575	0.00	2026-04-02 09:15:19.407
IRMENERGY	IRM Energy Limited	NSE	Equities	\N	184.04	185.57	190.00	178.55	238303	0.00	2026-04-02 09:15:19.414
ISFT	Intrasoft Technologies Limited	NSE	Information Technology	\N	63.00	59.56	64.41	55.79	20670	0.00	2026-04-02 09:15:22.234
ISGEC	Isgec Heavy Engineering Limited	NSE	Equities	\N	902.25	909.60	912.35	873.00	26891	0.00	2026-04-02 09:15:22.238
ISHANCH	Ishan Dyes and Chemicals Limited	NSE	Chemicals	\N	50.16	50.83	52.35	49.00	5639	0.00	2026-04-02 09:15:22.242
ITCHOTELS	ITC Hotels Limited	NSE	Equities	\N	146.75	147.39	148.36	141.73	2263514	0.00	2026-04-02 09:15:22.248
ITDC	India Tourism Development Corporation Limited	NSE	Equities	\N	401.20	395.50	405.90	382.00	21424	0.00	2026-04-02 09:15:22.252
ITI	ITI Limited	NSE	Equities	\N	251.28	255.34	253.72	245.87	439402	0.00	2026-04-02 09:15:22.255
IVC	IL&FS Investment Managers Limited	NSE	Equities	\N	6.91	6.67	7.11	6.59	359116	0.00	2026-04-02 09:15:22.262
IVP	IVP Limited	NSE	Equities	\N	125.25	122.56	128.00	119.00	1973	0.00	2026-04-02 09:15:22.265
IXIGO	Le Travenues Technology Limited	NSE	Information Technology	\N	164.30	175.42	171.90	163.65	1464381	0.00	2026-04-02 09:15:22.268
J&KBANK	The Jammu & Kashmir Bank Limited	NSE	Banking	\N	112.18	114.27	113.59	109.78	2508318	0.00	2026-04-02 09:15:22.27
JAGRAN	Jagran Prakashan Limited	NSE	Equities	\N	61.90	62.33	62.14	61.10	240101	0.00	2026-04-02 09:15:22.273
JAIBALAJI	Jai Balaji Industries Limited	NSE	Equities	\N	56.85	58.47	57.89	55.04	1341875	0.00	2026-04-02 09:15:22.281
JAICORPLTD	Jai Corp Limited	NSE	Equities	\N	94.99	96.50	96.40	92.48	427636	0.00	2026-04-02 09:15:22.283
JAINREC	Jain Resource Recycling Limited	NSE	Equities	\N	463.85	464.70	466.90	450.20	696718	0.00	2026-04-02 09:15:22.287
JAIPURKURT	Nandani Creation Limited	NSE	Equities	\N	27.12	27.44	27.87	26.69	5293	0.00	2026-04-02 09:15:22.29
JAMNAAUTO	Jamna Auto Industries Limited	NSE	Equities	\N	115.47	119.95	117.14	112.15	1294504	0.00	2026-04-02 09:15:22.399
JARO	Jaro Institute of Technology Management and Research Limited	NSE	Information Technology	\N	429.95	421.85	432.40	407.75	100307	0.00	2026-04-02 09:15:22.401
JASH	Jash Engineering Limited	NSE	Equities	\N	366.10	360.50	372.00	349.10	60655	0.00	2026-04-02 09:15:22.405
JAYAGROGN	Jayant Agro Organics Limited	NSE	Equities	\N	164.50	161.50	165.00	156.11	2259	0.00	2026-04-02 09:15:22.409
JAYKAY	Jaykay Enterprises Limited	NSE	Equities	\N	138.00	136.36	139.43	127.80	183865	0.00	2026-04-02 09:15:22.415
JAYNECOIND	Jayaswal Neco Industries Limited	NSE	Equities	\N	78.70	75.01	79.95	72.50	5709671	0.00	2026-04-02 09:15:22.418
JAYSREETEA	Jayshree Tea & Industries Limited	NSE	Equities	\N	77.02	75.52	77.70	73.00	53898	0.00	2026-04-02 09:15:22.422
JBCHEPHARM	JB Chemicals & Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	1959.00	2008.80	1998.80	1892.60	167917	0.00	2026-04-02 09:15:22.427
JBMA	JBM Auto Limited	NSE	Equities	\N	557.95	561.10	571.50	536.80	1452859	0.00	2026-04-02 09:15:22.429
JETFREIGHT	Jet Freight Logistics Limited	NSE	Equities	\N	17.50	17.07	17.90	16.83	22325	0.00	2026-04-02 09:15:22.433
JGCHEM	J.G.Chemicals Limited	NSE	Chemicals	\N	334.20	335.25	337.85	322.00	33872	0.00	2026-04-02 09:15:22.441
JINDALPHOT	Jindal Photo Limited	NSE	Equities	\N	1044.05	1050.30	1055.55	1010.05	2237	0.00	2026-04-02 09:15:22.447
JINDALPOLY	Jindal Poly Films Limited	NSE	Equities	\N	772.35	735.60	772.35	730.55	121262	0.00	2026-04-02 09:15:22.451
JINDALSAW	Jindal Saw Limited	NSE	Equities	\N	188.95	191.34	189.60	184.45	2238112	0.00	2026-04-02 09:15:22.453
JINDALSTEL	JINDAL STEEL LIMITED	NSE	Metals & Mining	\N	1135.90	1137.40	1146.30	1093.80	951487	0.00	2026-04-02 09:15:22.457
JINDRILL	Jindal Drilling And Industries Limited	NSE	Equities	\N	473.80	475.60	483.80	460.10	267520	0.00	2026-04-02 09:15:22.46
JIOFIN	Jio Financial Services Limited	NSE	Equities	\N	227.55	231.93	229.20	223.55	15895024	0.00	2026-04-02 09:15:22.466
JISLDVREQS	Jain Irrigation Systems Limited	NSE	Equities	\N	20.49	20.36	20.87	19.52	664	0.00	2026-04-02 09:15:22.468
JISLJALEQS	Jain Irrigation Systems Limited	NSE	Equities	\N	29.14	29.42	29.72	27.80	2700399	0.00	2026-04-02 09:15:22.472
JKCEMENT	JK Cement Limited	NSE	Equities	\N	5119.50	5140.00	5170.00	4990.50	22432	0.00	2026-04-02 09:15:22.474
JKIL	J.Kumar Infraprojects Limited	NSE	Equities	\N	450.00	455.85	458.40	436.55	65777	0.00	2026-04-02 09:15:22.477
JKIPL	Jinkushal Industries Limited	NSE	Equities	\N	54.49	50.90	54.99	49.63	55866	0.00	2026-04-02 09:15:22.48
JKPAPER	JK Paper Limited	NSE	Equities	\N	326.50	332.70	330.90	315.30	228462	0.00	2026-04-02 09:15:22.486
JKTYRE	JK Tyre & Industries Limited	NSE	Equities	\N	385.85	393.80	391.35	376.60	575377	0.00	2026-04-02 09:15:22.489
JLHL	Jupiter Life Line Hospitals Limited	NSE	Healthcare	\N	1235.40	1246.90	1254.90	1222.50	10980	0.00	2026-04-02 09:15:22.492
JMA	Jullundur Motor Agency (Delhi) Limited	NSE	Automobile	\N	80.70	80.84	80.84	79.00	4031	0.00	2026-04-02 09:15:22.495
JMFINANCIL	JM Financial Limited	NSE	Equities	\N	118.92	120.30	120.32	115.40	1644801	0.00	2026-04-02 09:15:22.498
JNKINDIA	JNK India Limited	NSE	Equities	\N	242.75	229.86	244.85	220.86	711185	0.00	2026-04-02 09:15:22.501
JOCIL	Jocil Limited	NSE	Equities	\N	106.59	100.79	106.60	93.30	3448	0.00	2026-04-02 09:15:25.24
JPPOWER	Jaiprakash Power Ventures Limited	NSE	Equities	\N	14.86	14.94	15.08	14.40	45154778	0.00	2026-04-02 09:15:25.249
JSFB	Jana Small Finance Bank Limited	NSE	Banking	\N	368.85	369.30	373.35	356.00	99578	0.00	2026-04-02 09:15:25.253
JSL	Jindal Stainless Limited	NSE	Equities	\N	716.55	704.85	722.85	690.15	658254	0.00	2026-04-02 09:15:25.257
JSLL	Jeena Sikho Lifecare Limited	NSE	Equities	\N	598.05	588.75	616.00	565.15	1064829	0.00	2026-04-02 09:15:25.26
JSWCEMENT	JSW Cement Limited	NSE	Equities	\N	115.14	114.73	115.63	111.94	695626	0.00	2026-04-02 09:15:25.263
JSWENERGY	JSW Energy Limited	NSE	Equities	\N	486.65	484.15	491.85	466.30	2389268	0.00	2026-04-02 09:15:25.267
JSWINFRA	JSW Infrastructure Limited	NSE	Equities	\N	238.96	247.95	243.98	237.76	1646749	0.00	2026-04-02 09:15:25.272
JSWSTEEL	JSW Steel Limited	NSE	Metals & Mining	\N	1135.90	1140.40	1145.80	1106.40	1693531	0.00	2026-04-02 09:15:25.276
JTEKTINDIA	Jtekt India Limited	NSE	Equities	\N	126.00	125.34	126.95	120.50	47373	0.00	2026-04-02 09:15:25.278
JTLIND	JTL INDUSTRIES LIMITED	NSE	Equities	\N	49.06	48.58	51.39	45.57	4600619	0.00	2026-04-02 09:15:25.282
KALYANI	Kalyani Commercials Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
KAPSTON	Kapston Services Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
KAVDEFENCE	Kavveri Defence & Wireless Technologies Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
KOPRAN	Kopran Limited	NSE	Equities	\N	118.71	118.80	120.70	113.16	202725	0.00	2026-04-02 09:15:28.327
JUBLINGREA	Jubilant Ingrevia Limited	NSE	Equities	\N	571.65	573.00	582.50	553.75	114343	0.00	2026-04-02 09:15:25.3
JUBLPHARMA	Jubilant Pharmova Limited	NSE	Equities	\N	835.80	816.55	837.85	800.05	168185	0.00	2026-04-02 09:15:25.302
JUNIPER	Juniper Hotels Limited	NSE	Equities	\N	202.55	203.73	203.01	193.60	45225	0.00	2026-04-02 09:15:25.305
JWL	Jupiter Wagons Limited	NSE	Equities	\N	253.25	256.68	256.67	246.60	1329853	0.00	2026-04-02 09:15:25.312
JYOTHYLAB	Jyothy Labs Limited	NSE	Equities	\N	207.18	205.63	209.07	198.43	317793	0.00	2026-04-02 09:15:25.314
JYOTICNC	Jyoti CNC Automation Limited	NSE	Equities	\N	766.80	766.05	773.80	740.35	149458	0.00	2026-04-02 09:15:25.318
JYOTISTRUC	Jyoti Structures Limited	NSE	Equities	\N	10.33	10.35	10.53	9.85	12269124	0.00	2026-04-02 09:15:25.321
KAJARIACER	Kajaria Ceramics Limited	NSE	Equities	\N	972.85	991.80	980.35	947.50	214324	0.00	2026-04-02 09:15:25.328
KAKATCEM	Kakatiya Cement Sugar & Industries Limited	NSE	Equities	\N	94.00	92.61	96.00	88.40	4708	0.00	2026-04-02 09:15:25.331
KALAMANDIR	Sai Silks (Kalamandir) Limited	NSE	Equities	\N	94.90	101.34	100.00	94.70	1327803	0.00	2026-04-02 09:15:25.335
KALPATARU	Kalpataru Limited	NSE	Equities	\N	286.50	274.90	289.20	267.30	35689	0.00	2026-04-02 09:15:25.338
KALYANIFRG	Kalyani Forge Limited	NSE	Equities	\N	584.00	573.55	585.00	560.45	1680	0.00	2026-04-02 09:15:25.344
KALYANKJIL	Kalyan Jewellers India Limited	NSE	Equities	\N	389.10	387.10	391.85	374.60	2347576	0.00	2026-04-02 09:15:25.347
KAMATHOTEL	Kamat Hotels (I) Limited	NSE	Equities	\N	157.07	156.96	158.00	147.70	27432	0.00	2026-04-02 09:15:25.352
KAMDHENU	Kamdhenu Limited	NSE	Equities	\N	18.85	18.79	19.09	17.60	723856	0.00	2026-04-02 09:15:25.356
KANANIIND	Kanani Industries Limited	NSE	Equities	\N	1.29	1.27	1.40	1.12	330605	0.00	2026-04-02 09:15:25.362
KANORICHEM	Kanoria Chemicals & Industries Limited	NSE	Chemicals	\N	63.50	61.19	65.07	59.00	12698	0.00	2026-04-02 09:15:25.364
KANPRPLA	Kanpur Plastipack Limited	NSE	Equities	\N	176.00	171.62	179.00	165.00	7283	0.00	2026-04-02 09:15:25.367
KANSAINER	Kansai Nerolac Paints Limited	NSE	Chemicals	\N	177.05	175.56	177.80	170.89	181942	0.00	2026-04-02 09:15:25.369
KARMAENG	Karma Energy Limited	NSE	Equities	\N	37.38	36.15	37.48	34.60	2190	0.00	2026-04-02 09:15:25.372
KARURVYSYA	Karur Vysya Bank Limited	NSE	Banking	\N	270.95	291.85	288.90	270.00	6577959	0.00	2026-04-02 09:15:25.374
KAYA	Kaya Limited	NSE	Equities	\N	256.00	249.43	256.50	242.62	11242	0.00	2026-04-02 09:15:25.381
KAYNES	Kaynes Technology India Limited	NSE	Information Technology	\N	3468.00	3539.90	3513.80	3380.00	1399415	0.00	2026-04-02 09:15:25.384
KCP	KCP Limited	NSE	Equities	\N	133.82	133.53	135.06	128.40	113202	0.00	2026-04-02 09:15:25.389
KCPSUGIND	KCP Sugar and Industries Corporation Limited	NSE	Equities	\N	23.73	23.96	24.19	23.10	130835	0.00	2026-04-02 09:15:25.392
KDDL	KDDL Limited	NSE	Equities	\N	2190.10	2162.30	2222.30	2020.00	7729	0.00	2026-04-02 09:15:25.395
KEC	KEC International Limited	NSE	Equities	\N	516.50	522.05	522.00	501.05	417825	0.00	2026-04-02 09:15:25.4
KECL	Kirloskar Electric Company Limited	NSE	Equities	\N	86.43	88.48	87.49	83.01	154661	0.00	2026-04-02 09:15:25.404
KEI	KEI Industries Limited	NSE	Equities	\N	4023.00	4134.80	4109.50	3953.30	413465	0.00	2026-04-02 09:15:25.412
KELLTONTEC	Kellton Tech Solutions Limited	NSE	Information Technology	\N	14.85	15.04	15.20	14.00	2577288	0.00	2026-04-02 09:15:25.415
KESORAMIND	Kesoram Industries Limited	NSE	Equities	\N	8.59	8.32	8.87	7.97	743673	0.00	2026-04-02 09:15:28.239
KEYFINSERV	Keynote Financial Services Limited	NSE	Equities	\N	231.99	231.83	235.00	225.61	358	0.00	2026-04-02 09:15:28.243
KFINTECH	Kfin Technologies Limited	NSE	Information Technology	\N	896.70	903.00	903.80	877.45	391417	0.00	2026-04-02 09:15:28.247
KHADIM	Khadim India Limited	NSE	Equities	\N	82.40	85.01	84.90	81.21	136624	0.00	2026-04-02 09:15:28.252
KHAITANLTD	Khaitan (India) Limited	NSE	Equities	\N	99.99	98.02	100.30	94.99	1270	0.00	2026-04-02 09:15:28.258
KHANDSE	Khandwala Securities Limited	NSE	Equities	\N	14.19	13.74	14.20	13.10	1142	0.00	2026-04-02 09:15:28.261
KICL	Kalyani Investment Company Limited	NSE	Equities	\N	4231.00	4224.20	4271.70	4110.00	1227	0.00	2026-04-02 09:15:28.264
KILITCH	Kilitch Drugs (India) Limited	NSE	Pharmaceuticals	\N	138.80	138.35	139.94	132.20	8514	0.00	2026-04-02 09:15:28.267
KIMS	Krishna Institute of Medical Sciences Limited	NSE	Equities	\N	626.00	624.90	629.60	613.00	102410	0.00	2026-04-02 09:15:28.27
KIOCL	KIOCL Limited	NSE	Equities	\N	339.00	344.50	343.20	328.00	181541	0.00	2026-04-02 09:15:28.276
KIRIINDUS	Kiri Industries Limited	NSE	Equities	\N	371.35	364.95	378.00	350.05	304198	0.00	2026-04-02 09:15:28.278
KIRLOSBROS	Kirloskar Brothers Limited	NSE	Equities	\N	1387.10	1410.70	1402.60	1350.60	49553	0.00	2026-04-02 09:15:28.282
KIRLOSENG	Kirloskar Oil Engines Limited	NSE	Equities	\N	1365.70	1367.00	1377.00	1320.30	103335	0.00	2026-04-02 09:15:28.287
KIRLOSIND	Kirloskar Industries Limited	NSE	Equities	\N	2743.40	2674.90	2807.90	2601.10	8667	0.00	2026-04-02 09:15:28.29
KIRLPNU	Kirloskar Pneumatic Company Limited	NSE	Equities	\N	1078.10	1085.80	1090.00	1048.70	19818	0.00	2026-04-02 09:15:28.293
KITEX	Kitex Garments Limited	NSE	Textile	\N	153.93	155.65	156.52	148.15	798297	0.00	2026-04-02 09:15:28.296
KKCL	Kewal Kiran Clothing Limited	NSE	Equities	\N	443.45	440.90	445.00	430.65	5834	0.00	2026-04-02 09:15:28.3
KMEW	Knowledge Marine & Engineering Works Limited	NSE	Equities	\N	1550.10	1578.10	1578.00	1508.80	36405	0.00	2026-04-02 09:15:28.303
KERNEX	Kernex Microsystems (India) Limited	NSE	Equities	\N	958.15	955.85	966.00	904.00	107052	0.00	2026-04-02 09:15:28.233
KNAGRI	KN Agri Resources Limited	NSE	Equities	\N	183.99	180.58	189.60	177.04	12405	0.00	2026-04-02 09:15:28.311
KNRCON	KNR Constructions Limited	NSE	Equities	\N	122.03	123.81	122.95	116.70	4757892	0.00	2026-04-02 09:15:28.313
KOHINOOR	Kohinoor Foods Limited	NSE	Equities	\N	21.16	20.86	21.20	20.25	69261	0.00	2026-04-02 09:15:28.318
KOKUYOCMLN	Kokuyo Camlin Limited	NSE	Equities	\N	74.60	73.98	75.50	72.61	37311	0.00	2026-04-02 09:15:28.321
KOLTEPATIL	Kolte - Patil Developers Limited	NSE	Equities	\N	303.60	297.70	307.05	294.70	67769	0.00	2026-04-02 09:15:28.324
KSHITIJPOL	Kshitij Polyline Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
KSR	KSR Footwear Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
LAKPRE	Lakshmi Precision Screws Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
LANCORHOL	Lancor Holdings Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
LAXMICOT	Laxmi Cotspin Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
LCCINFOTEC	LCC Infotech Limited	NSE	Information Technology	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
LEXUS	Lexus Granito (India) Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
KOTYARK	Kotyark Industries Limited	NSE	Equities	\N	393.15	397.15	400.85	390.15	19901	0.00	2026-04-02 09:15:28.341
KPEL	K.P. Energy Limited	NSE	Equities	\N	277.00	274.78	281.19	263.42	166893	0.00	2026-04-02 09:15:28.343
KPIGREEN	KPI Green Energy Limited	NSE	Energy	\N	386.40	387.70	392.40	366.00	699713	0.00	2026-04-02 09:15:28.345
KPIL	Kalpataru Projects International Limited	NSE	Equities	\N	1096.70	1096.50	1102.70	1049.00	80990	0.00	2026-04-02 09:15:28.349
KPITTECH	KPIT Technologies Limited	NSE	Information Technology	\N	691.65	674.30	698.90	652.05	1455619	0.00	2026-04-02 09:15:28.352
KPRMILL	K.P.R. Mill Limited	NSE	Equities	\N	823.25	837.40	831.75	814.05	88612	0.00	2026-04-02 09:15:28.354
KRBL	KRBL Limited	NSE	Equities	\N	303.05	302.85	308.45	292.00	372750	0.00	2026-04-02 09:15:28.357
KRIDHANINF	Kridhan Infra Limited	NSE	Equities	\N	2.05	1.96	2.05	1.98	40579	0.00	2026-04-02 09:15:28.362
KRISHANA	Krishana Phoschem Limited	NSE	Equities	\N	530.05	498.30	538.50	482.00	350007	0.00	2026-04-02 09:15:28.365
KRISHIVAL	Krishival Foods Limited	NSE	Equities	\N	322.30	319.95	322.75	319.95	1827	0.00	2026-04-02 09:15:28.367
KRITI	Kriti Industries (India) Limited	NSE	Equities	\N	70.00	68.44	71.19	66.26	62193	0.00	2026-04-02 09:15:28.371
KRITIKA	Kritika Wires Limited	NSE	Equities	\N	5.17	5.12	5.20	4.96	145262	0.00	2026-04-02 09:15:28.374
KRN	KRN Heat Exchanger and Refrigeration Limited	NSE	Equities	\N	856.50	891.20	878.00	844.05	619844	0.00	2026-04-02 09:15:28.379
KRONOX	Kronox Lab Sciences Limited	NSE	Equities	\N	116.40	114.24	117.99	106.00	73680	0.00	2026-04-02 09:15:28.382
KROSS	Kross Limited	NSE	Equities	\N	157.55	161.32	160.00	150.52	644267	0.00	2026-04-02 09:15:28.385
KRSNAA	Krsnaa Diagnostics Limited	NSE	Healthcare	\N	543.90	561.15	557.05	536.80	56932	0.00	2026-04-02 09:15:31.264
KRYSTAL	Krystal Integrated Services Limited	NSE	Equities	\N	530.75	540.90	539.90	508.50	5285	0.00	2026-04-02 09:15:31.268
KSB	Ksb Limited	NSE	Equities	\N	830.55	828.20	831.90	802.80	151541	0.00	2026-04-02 09:15:31.271
KSHINTL	KSH International Limited	NSE	Equities	\N	445.90	444.45	464.00	442.30	244923	0.00	2026-04-02 09:15:31.276
KSL	Kalyani Steels Limited	NSE	Metals & Mining	\N	614.25	611.05	623.50	593.45	33505	0.00	2026-04-02 09:15:31.278
KSOLVES	Ksolves India Limited	NSE	Equities	\N	282.60	267.28	294.60	257.00	261025	0.00	2026-04-02 09:15:31.283
KTKBANK	The Karnataka Bank Limited	NSE	Banking	\N	227.60	230.17	229.99	217.00	2887646	0.00	2026-04-02 09:15:31.287
KUANTUM	Kuantum Papers Limited	NSE	Equities	\N	69.74	69.08	70.38	66.94	75907	0.00	2026-04-02 09:15:31.289
KWIL	Kwality Wall's (India) Limited	NSE	Equities	\N	23.69	23.77	24.05	22.95	6043426	0.00	2026-04-02 09:15:31.292
LAL	Lorenzini Apparels Limited	NSE	Textile	\N	7.06	6.98	7.20	6.70	27833	0.00	2026-04-02 09:15:31.297
LALPATHLAB	Dr. Lal Path Labs Ltd.	NSE	Equities	\N	1323.30	1323.60	1328.10	1285.00	140352	0.00	2026-04-02 09:15:31.3
LAMBODHARA	Lambodhara Textiles Limited	NSE	Textile	\N	89.99	90.14	91.00	86.56	13339	0.00	2026-04-02 09:15:31.305
LANDMARK	Landmark Cars Limited	NSE	Equities	\N	406.40	401.20	413.00	385.80	85519	0.00	2026-04-02 09:15:31.308
LANDSMILL	Landsmill Green Limited	NSE	Equities	\N	1.04	1.02	1.04	0.98	2618216	0.00	2026-04-02 09:15:31.312
LAOPALA	La Opala RG Limited	NSE	Equities	\N	176.47	173.21	177.36	166.50	54463	0.00	2026-04-02 09:15:31.315
LATENTVIEW	Latent View Analytics Limited	NSE	Equities	\N	306.80	261.20	311.45	256.75	60673624	0.00	2026-04-02 09:15:31.319
LATTEYS	Latteys Industries Limited	NSE	Equities	\N	18.10	17.37	18.30	16.99	32470	0.00	2026-04-02 09:15:31.322
LAURUSLABS	Laurus Labs Limited	NSE	Equities	\N	1033.15	1038.80	1040.00	994.25	2216290	0.00	2026-04-02 09:15:31.325
LAXMIDENTL	Laxmi Dental Limited	NSE	Equities	\N	177.44	177.47	181.50	169.10	89005	0.00	2026-04-02 09:15:31.329
LAXMIINDIA	Laxmi India Finance Limited	NSE	Equities	\N	78.56	79.07	80.08	75.05	93290	0.00	2026-04-02 09:15:31.332
LGEINDIA	LG Electronics India Limited	NSE	Equities	\N	1314.90	1386.80	1385.00	1304.10	1462914	0.00	2026-04-02 09:15:31.35
LEMERITE	Le Merite Exports Limited	NSE	Equities	\N	444.80	442.90	500.00	441.30	8469	0.00	2026-04-02 09:15:31.335
LENSKART	Lenskart Solutions Limited	NSE	Equities	\N	486.60	501.85	498.00	481.75	904605	0.00	2026-04-02 09:15:31.341
LFIC	Lakshmi Finance & Industrial Corporation Limited	NSE	Equities	\N	116.42	117.00	116.42	114.03	103	0.00	2026-04-02 09:15:31.343
LGBBROSLTD	LG Balakrishnan & Bros Limited	NSE	Equities	\N	1693.80	1693.60	1718.70	1645.00	16096	0.00	2026-04-02 09:15:31.347
LGHL	Laxmi Goldorna House Limited	NSE	Equities	\N	236.06	233.99	239.75	228.21	24830	0.00	2026-04-02 09:15:31.356
LIBERTSHOE	Liberty Shoes Limited	NSE	Equities	\N	231.29	226.66	234.62	221.00	21676	0.00	2026-04-02 09:15:31.361
LICHSGFIN	LIC Housing Finance Limited	NSE	Equities	\N	513.35	515.55	517.45	501.75	1494090	0.00	2026-04-02 09:15:31.364
LICI	Life Insurance Corporation Of India	NSE	Financial Services	\N	729.95	746.00	738.00	721.50	1186522	0.00	2026-04-02 09:15:31.367
LIKHITHA	Likhitha Infrastructure Limited	NSE	Equities	\N	171.74	170.92	177.99	161.16	246930	0.00	2026-04-02 09:15:31.369
LINC	Linc Limited	NSE	Equities	\N	97.96	94.23	98.50	90.00	12258	0.00	2026-04-02 09:15:31.372
LINCOLN	Lincoln Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	608.60	594.85	614.40	585.45	23876	0.00	2026-04-02 09:15:31.374
LINDEINDIA	Linde India Limited	NSE	Equities	\N	7246.50	7002.00	7312.00	6772.50	57439	0.00	2026-04-02 09:15:31.377
LLOYDSENT	Lloyds Enterprises Limited	NSE	Equities	\N	44.77	44.78	45.40	42.79	2507777	0.00	2026-04-02 09:15:31.385
LLOYDSME	Lloyds Metals And Energy Limited	NSE	Equities	\N	1362.00	1347.60	1366.60	1290.00	664711	0.00	2026-04-02 09:15:31.388
LMW	LMW Limited	NSE	Equities	\N	12126.00	12426.00	12305.00	11982.00	5643	0.00	2026-04-02 09:15:31.39
KOTHARIPET	Kothari Petrochemicals Limited	NSE	Chemicals	\N	110.17	104.54	111.22	102.56	36375	0.00	2026-04-02 09:15:28.336
LOYALTEX	Loyal Textile Mills Limited	NSE	Textile	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.545578
MAHAPE-RE	Maha Rashtra Apex Corporation Limited-RE	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MAHASTEEL	Mahamaya Steel Industries Limited	NSE	Metals & Mining	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MANAKALUCO	Manaksia Aluminium Company Limited	NSE	Metals & Mining	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MANGALAM	Mangalam Drugs And Organics Limited	NSE	Pharmaceuticals	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MARKSANS	Marksans Pharma Limited	NSE	Pharmaceuticals	\N	166.55	168.04	168.54	160.60	471858	0.00	2026-04-02 09:13:28.294
LORDSCHLO	Lords Chloro Alkali Limited	NSE	Equities	\N	120.63	117.52	124.80	117.74	15588	0.00	2026-04-02 09:15:31.399
LOTUSEYE	Lotus Eye Hospital and Institute Limited	NSE	Healthcare	\N	103.12	101.84	104.95	101.06	1497	0.00	2026-04-02 09:15:31.409
LOVABLE	Lovable Lingerie Limited	NSE	Equities	\N	61.75	61.36	61.80	59.44	6759	0.00	2026-04-02 09:15:31.413
LPDC	Landmark Property Development Company Limited	NSE	Equities	\N	5.78	5.68	6.10	5.53	8676	0.00	2026-04-02 09:15:31.417
LT	Larsen & Toubro Limited	NSE	Equities	\N	3590.70	3607.50	3615.00	3470.00	3126235	0.00	2026-04-02 09:15:31.419
LTF	L&T Finance Limited	NSE	Equities	\N	239.00	244.64	241.99	234.90	3728072	0.00	2026-04-02 09:13:25.282
LTFOODS	LT Foods Limited	NSE	Equities	\N	385.85	384.00	387.00	370.25	392335	0.00	2026-04-02 09:13:25.284
LTM	LTIMindtree Limited	NSE	Equities	\N	4288.60	4107.00	4318.90	4016.60	408964	0.00	2026-04-02 09:13:25.287
LUMAXIND	Lumax Industries Limited	NSE	Equities	\N	4719.50	4805.40	4795.00	4620.00	12188	0.00	2026-04-02 09:13:25.293
LUMAXTECH	Lumax Auto Technologies Limited	NSE	Information Technology	\N	1574.80	1593.50	1584.20	1535.00	74423	0.00	2026-04-02 09:13:25.295
LUPIN	Lupin Limited	NSE	Equities	\N	2265.60	2274.90	2274.80	2170.10	901600	0.00	2026-04-02 09:13:25.298
LUXIND	Lux Industries Limited	NSE	Equities	\N	898.10	907.35	908.55	871.10	21751	0.00	2026-04-02 09:13:25.301
LXCHEM	Laxmi Organic Industries Limited	NSE	Equities	\N	116.69	116.96	118.86	112.29	412963	0.00	2026-04-02 09:13:25.304
LYKALABS	Lyka Labs Limited	NSE	Equities	\N	56.00	51.17	56.00	49.33	48983	0.00	2026-04-02 09:13:25.306
LYPSAGEMS	Lypsa Gems & Jewellery Limited	NSE	Consumer Goods	\N	4.75	4.65	4.94	4.60	25783	0.00	2026-04-02 09:13:25.309
M&M	Mahindra & Mahindra Limited	NSE	Equities	\N	3002.50	3031.50	3028.80	2928.10	2472612	0.00	2026-04-02 09:13:25.311
MAANALU	Maan Aluminium Limited	NSE	Metals & Mining	\N	127.05	126.01	128.85	122.51	43699	0.00	2026-04-02 09:13:25.316
MACPOWER	Macpower CNC Machines Limited	NSE	Equities	\N	848.90	867.40	867.40	835.85	12978	0.00	2026-04-02 09:13:25.319
MADHAV	Madhav Marbles and Granites Limited	NSE	Equities	\N	32.92	32.33	32.92	31.00	2627	0.00	2026-04-02 09:13:25.322
MADHUCON	Madhucon Projects Limited	NSE	Equities	\N	4.11	3.92	4.11	3.95	12330	0.00	2026-04-02 09:13:25.325
MADRASFERT	Madras Fertilizers Limited	NSE	Chemicals	\N	58.69	58.24	59.25	55.02	82754	0.00	2026-04-02 09:13:25.328
MAGADSUGAR	Magadh Sugar & Energy Limited	NSE	Equities	\N	491.60	488.15	494.75	476.00	26469	0.00	2026-04-02 09:13:25.331
MAGNUM	Magnum Ventures Limited	NSE	Equities	\N	21.00	19.44	21.60	18.68	37542	0.00	2026-04-02 09:13:25.334
MAHAPEXLTD	Maha Rashtra Apex Corporation Limited	NSE	Equities	\N	45.55	52.99	55.44	44.43	97999	0.00	2026-04-02 09:13:25.339
MAHEPC	Mahindra EPC Irrigation Limited	NSE	Equities	\N	104.39	100.66	104.80	98.01	31095	0.00	2026-04-02 09:13:25.343
MAHESHWARI	Maheshwari Logistics Limited	NSE	Equities	\N	44.01	44.06	44.80	43.70	2348	0.00	2026-04-02 09:13:25.345
MAHLIFE	Mahindra Lifespace Developers Limited	NSE	Equities	\N	318.80	315.40	322.80	302.50	86747	0.00	2026-04-02 09:13:25.349
MAHLOG	Mahindra Logistics Limited	NSE	Equities	\N	346.00	348.40	349.00	333.05	57727	0.00	2026-04-02 09:13:25.351
MAHSEAMLES	Maharashtra Seamless Limited	NSE	Equities	\N	584.30	580.50	589.50	563.60	157102	0.00	2026-04-02 09:13:25.357
MAITHANALL	Maithan Alloys Limited	NSE	Equities	\N	910.00	895.20	914.90	852.00	26032	0.00	2026-04-02 09:13:25.36
MALLCOM	Mallcom (India) Limited	NSE	Equities	\N	998.80	1019.40	1006.30	975.05	2998	0.00	2026-04-02 09:13:25.362
MALUPAPER	Malu Paper Mills Limited	NSE	Equities	\N	30.05	29.99	31.39	28.60	4831	0.00	2026-04-02 09:13:25.366
MAMATA	Mamata Machinery Limited	NSE	Equities	\N	337.95	325.00	345.00	309.40	154249	0.00	2026-04-02 09:13:28.228
MANAKCOAT	Manaksia Coated Metals & Industries Limited	NSE	Equities	\N	101.69	100.04	103.18	96.29	826058	0.00	2026-04-02 09:13:28.232
MANAKSIA	Manaksia Limited	NSE	Equities	\N	47.78	47.04	47.78	44.91	25165	0.00	2026-04-02 09:13:28.235
MANALIPETC	Manali Petrochemicals Limited	NSE	Chemicals	\N	42.58	41.76	42.83	40.07	278731	0.00	2026-04-02 09:13:28.24
MANAPPURAM	Manappuram Finance Limited	NSE	Equities	\N	253.40	255.40	255.80	247.80	4612335	0.00	2026-04-02 09:13:28.243
MANBA	Manba Finance Limited	NSE	Equities	\N	105.16	102.35	105.40	102.42	45310	0.00	2026-04-02 09:13:28.246
MANCREDIT	Mangal Credit and Fincorp Limited	NSE	Equities	\N	168.18	171.55	175.00	166.05	16900	0.00	2026-04-02 09:13:28.249
MANGLMCEM	Mangalam Cement Limited	NSE	Equities	\N	803.45	798.20	822.30	778.10	50750	0.00	2026-04-02 09:13:28.252
MANINDS	Man Industries (India) Limited	NSE	Equities	\N	345.00	347.15	348.70	326.05	583510	0.00	2026-04-02 09:13:28.254
MANKIND	Mankind Pharma Limited	NSE	Pharmaceuticals	\N	1987.00	2001.30	2000.00	1928.00	538608	0.00	2026-04-02 09:13:28.261
MANOMAY	Manomay Tex India Limited	NSE	Equities	\N	229.70	233.59	235.58	228.11	51517	0.00	2026-04-02 09:13:28.264
MANORAMA	Manorama Industries Limited	NSE	Equities	\N	1208.10	1221.20	1220.50	1171.20	85775	0.00	2026-04-02 09:13:28.266
MANORG	Mangalam Organics Limited	NSE	Equities	\N	386.00	384.20	410.10	371.00	4570	0.00	2026-04-02 09:13:28.269
MANUGRAPH	Manugraph India Limited	NSE	Equities	\N	10.99	10.87	11.31	10.40	2696	0.00	2026-04-02 09:13:28.272
MANYAVAR	Vedant Fashions Limited	NSE	Equities	\N	365.20	374.35	371.00	361.70	174880	0.00	2026-04-02 09:13:28.275
MAPMYINDIA	C.E. Info Systems Limited	NSE	Equities	\N	869.30	863.55	883.00	822.40	103144	0.00	2026-04-02 09:13:28.277
MARATHON	Marathon Nextgen Realty Limited	NSE	Real Estate	\N	399.50	395.75	403.25	385.00	34201	0.00	2026-04-02 09:13:28.283
MARICO	Marico Limited	NSE	FMCG	\N	763.85	744.50	766.70	728.95	1932486	0.00	2026-04-02 09:13:28.285
MARINE	Marine Electricals (India) Limited	NSE	Equities	\N	171.31	169.84	175.00	162.90	375991	0.00	2026-04-02 09:13:28.288
MARKOLINES	Markolines Pavement Technologies Limited	NSE	Information Technology	\N	145.81	144.95	150.80	144.10	162137	0.00	2026-04-02 09:13:28.29
MCL	Madhav Copper Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MEP	MEP Infrastructure Developers Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MORARJEE	Morarjee Textiles Limited	NSE	Textile	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
MONTECARLO	Monte Carlo Fashions Limited	NSE	Equities	\N	497.00	490.50	499.95	480.00	10296	0.00	2026-04-02 09:13:31.341
MOREPENLAB	Morepen Laboratories Limited	NSE	Equities	\N	36.95	37.20	37.24	35.17	2876546	0.00	2026-04-02 09:13:31.343
MOSCHIP	Moschip Technologies Limited	NSE	Information Technology	\N	164.73	164.94	167.30	158.00	1441859	0.00	2026-04-02 09:13:31.347
MARSONS	Marsons Limited	NSE	Equities	\N	135.52	133.82	138.34	131.51	536711	0.00	2026-04-02 09:13:28.296
MASFIN	MAS Financial Services Limited	NSE	Equities	\N	294.25	293.25	297.10	285.00	65392	0.00	2026-04-02 09:13:28.301
MASKINVEST	Mask Investments Limited	NSE	Equities	\N	125.55	124.00	136.40	124.00	230	0.00	2026-04-02 09:13:28.305
MASTEK	Mastek Limited	NSE	Equities	\N	1493.40	1463.30	1511.10	1404.10	53116	0.00	2026-04-02 09:13:28.308
MATRIMONY	Matrimony.Com Limited	NSE	Equities	\N	431.90	435.15	434.30	419.55	3044	0.00	2026-04-02 09:13:28.313
MAWANASUG	Mawana Sugars Limited	NSE	Equities	\N	92.58	91.69	92.88	88.56	155923	0.00	2026-04-02 09:13:28.316
MAXESTATES	Max Estates Limited	NSE	Equities	\N	332.25	325.15	335.90	313.00	97639	0.00	2026-04-02 09:13:28.319
MAXIND	Max India Limited	NSE	Equities	\N	143.64	141.04	146.00	136.61	26624	0.00	2026-04-02 09:13:28.324
MAYURUNIQ	Mayur Uniquoters Ltd	NSE	Equities	\N	525.80	518.30	529.10	506.05	29634	0.00	2026-04-02 09:13:28.327
MAZDOCK	Mazagon Dock Shipbuilders Limited	NSE	Real Estate	\N	2236.00	2318.20	2271.30	2202.80	2663691	0.00	2026-04-02 09:13:28.332
MBAPL	Madhya Bharat Agro Products Limited	NSE	Equities	\N	526.00	504.80	534.95	490.25	456298	0.00	2026-04-02 09:13:28.335
MBEL	M & B Engineering Limited	NSE	Equities	\N	264.00	253.62	269.89	241.00	303564	0.00	2026-04-02 09:13:28.337
MBLINFRA	MBL Infrastructure Limited	NSE	Equities	\N	22.23	20.86	22.30	20.04	92738	0.00	2026-04-02 09:13:28.34
MCLOUD	Magellanic Cloud Limited	NSE	Equities	\N	21.06	20.72	21.39	20.11	840471	0.00	2026-04-02 09:13:28.346
MCX	Multi Commodity Exchange of India Limited	NSE	Equities	\N	2423.60	2469.70	2442.60	2360.00	2434881	0.00	2026-04-02 09:13:28.349
MEDANTA	Global Health Limited	NSE	Equities	\N	996.30	989.20	1003.75	959.65	287137	0.00	2026-04-02 09:13:28.351
MEDIASSIST	Medi Assist Healthcare Services Limited	NSE	Healthcare	\N	316.75	317.10	320.05	305.00	57567	0.00	2026-04-02 09:13:28.353
MEDICAMEQ	Medicamen Biotech Limited	NSE	Information Technology	\N	233.13	231.64	239.39	225.01	68758	0.00	2026-04-02 09:13:28.356
MEDICO	Medico Remedies Limited	NSE	Equities	\N	37.98	38.32	38.67	35.20	172108	0.00	2026-04-02 09:13:28.358
MEESHO	Meesho Limited	NSE	Equities	\N	146.30	147.37	147.07	141.52	2223719	0.00	2026-04-02 09:13:28.365
MEGASTAR	Megastar Foods Limited	NSE	Equities	\N	262.65	258.40	263.00	253.50	5867	0.00	2026-04-02 09:13:31.227
MEIL	Mangal Electrical Industries Limited	NSE	Equities	\N	236.85	232.70	240.39	221.74	46250	0.00	2026-04-02 09:13:31.231
MENONBE	Menon Bearings Limited	NSE	Equities	\N	108.05	107.84	108.50	105.19	8770	0.00	2026-04-02 09:13:31.234
METROBRAND	Metro Brands Limited	NSE	Equities	\N	929.25	919.95	931.70	886.50	17862	0.00	2026-04-02 09:13:31.237
MFML	Mahalaxmi Fabric Mills Limited	NSE	Textile	\N	23.17	23.20	23.20	22.20	514	0.00	2026-04-02 09:13:31.242
MFSL	Max Financial Services Limited	NSE	Equities	\N	1466.90	1477.40	1479.30	1433.60	674344	0.00	2026-04-02 09:13:31.246
MGEL	Mangalam Global Enterprise Limited	NSE	Equities	\N	11.15	11.43	11.80	11.13	169740	0.00	2026-04-02 09:13:31.249
MGL	Mahanagar Gas Limited	NSE	Equities	\N	946.75	943.60	954.35	924.15	215895	0.00	2026-04-02 09:13:31.251
MHLXMIRU	Mahalaxmi Rubtech Limited	NSE	Information Technology	\N	164.00	164.53	165.99	161.11	2222	0.00	2026-04-02 09:13:31.254
MHRIL	Mahindra Holidays & Resorts India Limited	NSE	Equities	\N	244.75	244.19	248.20	237.24	43589	0.00	2026-04-02 09:13:31.258
MICEL	MIC Electronics Limited	NSE	Equities	\N	33.03	31.46	33.03	30.20	1551820	0.00	2026-04-02 09:13:31.261
MIDWESTLTD	Midwest Limited	NSE	Equities	\N	1206.70	1209.70	1227.80	1156.70	20652	0.00	2026-04-02 09:13:31.267
MINDACORP	Minda Corporation Limited	NSE	Equities	\N	499.40	514.15	506.00	490.00	112238	0.00	2026-04-02 09:13:31.269
MINDTECK	Mindteck (India) Limited	NSE	Equities	\N	164.79	161.84	166.80	154.00	32350	0.00	2026-04-02 09:13:31.272
MIRCELECTR	MIRC Electronics Limited	NSE	Equities	\N	27.83	27.50	28.12	26.15	708392	0.00	2026-04-02 09:13:31.275
MIRZAINT	Mirza International Limited	NSE	Equities	\N	28.70	27.77	29.85	26.20	356915	0.00	2026-04-02 09:13:31.278
MITTAL	Mittal Life Style Limited	NSE	Equities	\N	0.89	0.89	0.92	0.82	552125	0.00	2026-04-02 09:13:31.284
MKPL	M K Proteins Limited	NSE	Equities	\N	4.74	4.37	4.75	4.22	279455	0.00	2026-04-02 09:13:31.287
MMFL	MM Forgings Limited	NSE	Equities	\N	406.10	404.90	410.00	388.15	29581	0.00	2026-04-02 09:13:31.289
MMP	MMP Industries Limited	NSE	Equities	\N	206.41	203.24	212.00	199.98	26484	0.00	2026-04-02 09:13:31.292
MMTC	MMTC Limited	NSE	Equities	\N	54.61	55.18	55.53	51.87	2466828	0.00	2026-04-02 09:13:31.295
MOBIKWIK	One Mobikwik Systems Limited	NSE	Equities	\N	165.57	169.41	168.30	160.80	644637	0.00	2026-04-02 09:13:31.298
MODINATUR	Modi Naturals Limited	NSE	Equities	\N	306.30	302.70	307.80	286.00	6686	0.00	2026-04-02 09:13:31.3
MODIRUBBER	Modi Rubber Limited	NSE	Equities	\N	111.99	114.77	113.80	110.02	1500	0.00	2026-04-02 09:13:31.303
MODIS	Modis Navnirman Limited	NSE	Equities	\N	299.00	300.20	304.40	293.05	81819	0.00	2026-04-02 09:13:31.306
MODTHREAD	Modern Threads (India) Limited	NSE	Equities	\N	45.82	43.69	45.82	42.11	627	0.00	2026-04-02 09:13:31.312
MOHITIND	Mohit Industries Limited	NSE	Equities	\N	19.51	19.50	19.98	19.50	832	0.00	2026-04-02 09:13:31.316
MOIL	MOIL Limited	NSE	Equities	\N	291.05	294.65	293.00	285.25	438568	0.00	2026-04-02 09:13:31.319
MOKSH	Moksh Ornaments Limited	NSE	Equities	\N	9.10	9.06	9.19	8.81	61247	0.00	2026-04-02 09:13:31.322
MOL	Meghmani Organics Limited	NSE	Equities	\N	44.15	42.31	44.90	40.05	981840	0.00	2026-04-02 09:13:31.325
MOLDTKPAC	Mold-Tek Packaging Limited	NSE	Equities	\N	513.95	499.45	521.20	480.55	45802	0.00	2026-04-02 09:13:31.332
MONARCH	Monarch Networth Capital Limited	NSE	Equities	\N	266.22	266.02	267.02	255.00	34898	0.00	2026-04-02 09:13:31.335
MONEYBOXX	Moneyboxx Finance Limited	NSE	Equities	\N	59.55	62.31	61.03	59.06	18411	0.00	2026-04-02 09:13:31.338
MTEDUCARE	MT Educare Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
NESCO	Nesco Limited	NSE	Equities	\N	1057.20	1043.20	1069.50	1011.00	28534	0.00	2026-04-02 09:13:37.352
NETWORK18	Network18 Media & Investments Limited	NSE	Equities	\N	29.64	30.37	30.17	28.61	4253399	0.00	2026-04-02 09:13:37.359
NEULANDLAB	Neuland Laboratories Limited	NSE	Equities	\N	12438.00	12613.00	12500.00	12060.00	17102	0.00	2026-04-02 09:13:37.433
MOTHERSON	Samvardhana Motherson International Limited	NSE	Equities	\N	106.33	107.62	107.20	102.82	18464687	0.00	2026-04-02 09:13:31.358
MOTILALOFS	Motilal Oswal Financial Services Limited	NSE	Equities	\N	680.25	680.00	687.30	655.65	730426	0.00	2026-04-02 09:13:31.36
MOTISONS	Motisons Jewellers Limited	NSE	Equities	\N	12.01	12.15	12.25	11.44	4334911	0.00	2026-04-02 09:13:31.363
MOTOGENFIN	The Motor & General Finance Limited	NSE	Automobile	\N	21.95	20.25	22.80	19.41	24377	0.00	2026-04-02 09:13:31.365
MPHASIS	MphasiS Limited	NSE	Equities	\N	2217.20	2136.60	2239.00	2085.40	617882	0.00	2026-04-02 09:13:31.369
MPSLTD	MPS Limited	NSE	Equities	\N	1650.00	1627.10	1679.70	1575.10	15435	0.00	2026-04-02 09:13:31.372
MRPL	Mangalore Refinery and Petrochemicals Limited	NSE	Chemicals	\N	181.29	184.14	182.87	176.00	5919336	0.00	2026-04-02 09:13:31.378
MSPL	MSP Steel & Power Limited	NSE	Metals & Mining	\N	31.00	29.09	31.99	29.19	4629715	0.00	2026-04-02 09:13:31.381
MSTCLTD	Mstc Limited	NSE	Equities	\N	404.65	388.30	411.20	377.45	254834	0.00	2026-04-02 09:13:34.227
MTNL	Mahanagar Telephone Nigam Limited	NSE	Equities	\N	24.24	24.11	24.34	23.02	1544257	0.00	2026-04-02 09:13:34.236
MUFIN	Mufin Green Finance Limited	NSE	Equities	\N	99.73	101.89	102.01	98.50	1145995	0.00	2026-04-02 09:13:34.239
MUFTI	Credo Brands Marketing Limited	NSE	Equities	\N	71.37	67.91	73.40	64.20	200324	0.00	2026-04-02 09:13:34.246
MUKANDLTD	Mukand Limited	NSE	Equities	\N	122.29	124.58	123.99	120.05	38941	0.00	2026-04-02 09:13:34.249
MUKKA	Mukka Proteins Limited	NSE	Equities	\N	20.73	20.36	20.94	19.68	154477	0.00	2026-04-02 09:13:34.252
MUKTAARTS	Mukta Arts Limited	NSE	Equities	\N	41.60	41.41	43.49	39.51	5030	0.00	2026-04-02 09:13:34.255
MUNJALSHOW	Munjal Showa Limited	NSE	Equities	\N	115.87	115.44	116.50	113.15	14009	0.00	2026-04-02 09:13:34.261
MURUDCERA	Murudeshwar Ceramics Limited	NSE	Equities	\N	26.78	27.06	27.00	26.29	8555	0.00	2026-04-02 09:13:34.265
MUTHOOTCAP	Muthoot Capital Services Limited	NSE	Financial Services	\N	183.13	181.10	185.39	176.00	25481	0.00	2026-04-02 09:13:34.268
MUTHOOTFIN	Muthoot Finance Limited	NSE	Financial Services	\N	3161.60	3256.00	3200.20	3145.00	463600	0.00	2026-04-02 09:13:34.271
MUTHOOTMF	Muthoot Microfin Limited	NSE	Financial Services	\N	152.37	150.43	153.96	145.80	79306	0.00	2026-04-02 09:13:34.274
MVGJL	Manoj Vaibhav Gems N Jewellers Limited	NSE	Equities	\N	144.17	143.87	145.53	138.33	46236	0.00	2026-04-02 09:13:34.277
MWL	Mangalam Worldwide Limited	NSE	Equities	\N	261.00	260.95	265.00	257.00	70988	0.00	2026-04-02 09:13:34.28
NAGAFERT	Nagarjuna Fertilizers and Chemicals Limited	NSE	Chemicals	\N	3.81	3.67	3.82	3.59	455552	0.00	2026-04-02 09:13:34.285
NAGREEKCAP	Nagreeka Capital & Infrastructure Limited	NSE	Equities	\N	22.71	22.22	23.55	21.31	881	0.00	2026-04-02 09:13:34.289
NAGREEKEXP	Nagreeka Exports Limited	NSE	Equities	\N	20.20	20.20	20.20	19.31	1364	0.00	2026-04-02 09:13:34.291
NAHARCAP	Nahar Capital and Financial Services Limited	NSE	Equities	\N	213.81	209.25	216.38	201.73	6852	0.00	2026-04-02 09:13:34.294
NAHARINDUS	Nahar Industrial Enterprises Limited	NSE	Equities	\N	91.50	90.23	92.70	87.51	12040	0.00	2026-04-02 09:13:34.297
NAHARSPING	Nahar Spinning Mills Limited	NSE	Textile	\N	221.61	214.31	224.00	209.00	47575	0.00	2026-04-02 09:13:34.303
NAM-INDIA	Nippon Life India Asset Management Limited	NSE	Financial Services	\N	829.70	865.15	845.55	810.00	729506	0.00	2026-04-02 09:13:34.306
NARMADA	Narmada Agrobase Limited	NSE	Equities	\N	32.41	32.47	32.84	31.02	120209	0.00	2026-04-02 09:13:34.309
NATCAPSUQ	Natural Capsules Limited	NSE	Equities	\N	151.99	153.62	157.59	150.00	862	0.00	2026-04-02 09:13:34.311
NATCOPHARM	Natco Pharma Limited	NSE	Pharmaceuticals	\N	1021.95	1001.90	1030.45	978.45	907098	0.00	2026-04-02 09:13:34.315
NATHBIOGEN	Nath Bio-Genes (India) Limited	NSE	Equities	\N	138.00	137.46	139.00	134.00	15426	0.00	2026-04-02 09:13:34.317
NAUKRI	Info Edge (India) Limited	NSE	Equities	\N	988.95	985.25	993.35	960.00	1140605	0.00	2026-04-02 09:13:34.322
NAVA	NAVA LIMITED	NSE	Equities	\N	556.15	563.50	561.50	541.75	176175	0.00	2026-04-02 09:13:34.325
NAVINFLUOR	Navin Fluorine International Limited	NSE	Equities	\N	5809.50	6034.00	5900.00	5666.50	153893	0.00	2026-04-02 09:13:34.328
NAVKARCORP	Navkar Corporation Limited	NSE	Equities	\N	82.80	79.48	83.43	77.29	201367	0.00	2026-04-02 09:13:34.33
NAVKARURB	Navkar Urbanstructure Limited	NSE	Equities	\N	0.73	0.74	0.75	0.71	1217802	0.00	2026-04-02 09:13:34.333
NAVNETEDUL	Navneet Education Limited	NSE	Equities	\N	129.00	130.27	129.79	126.30	48857	0.00	2026-04-02 09:13:34.335
NAZARA	Nazara Technologies Limited	NSE	Information Technology	\N	233.20	236.84	238.00	228.38	2289482	0.00	2026-04-02 09:13:34.338
NBCC	NBCC (India) Limited	NSE	Equities	\N	82.08	82.79	82.80	79.29	9483195	0.00	2026-04-02 09:13:34.342
NCC	NCC Limited	NSE	Equities	\N	140.36	138.59	141.35	134.47	1448532	0.00	2026-04-02 09:13:34.347
NCLIND	NCL Industries Limited	NSE	Equities	\N	162.84	157.15	165.68	153.94	68387	0.00	2026-04-02 09:13:34.351
NDGL	Naga Dhunseri Group Limited	NSE	Equities	\N	2437.00	2371.40	2438.00	2264.70	152	0.00	2026-04-02 09:13:34.353
NDL	Nandan Denim Limited	NSE	Equities	\N	2.44	2.20	2.57	2.10	4508120	0.00	2026-04-02 09:13:34.356
NDLVENTURE	NDL Ventures Limited	NSE	Equities	\N	121.15	121.40	125.00	116.10	25838	0.00	2026-04-02 09:13:34.359
NECCLTD	North Eastern Carrying Corporation Limited	NSE	Equities	\N	12.77	12.15	12.86	11.55	85141	0.00	2026-04-02 09:13:34.366
NECLIFE	Nectar Lifesciences Limited	NSE	Equities	\N	10.03	9.76	10.15	9.71	514344	0.00	2026-04-02 09:13:34.369
NELCAST	Nelcast Limited	NSE	Equities	\N	122.67	120.99	124.19	117.10	60633	0.00	2026-04-02 09:13:34.372
NELCO	NELCO Limited	NSE	Equities	\N	554.25	554.85	564.40	531.05	72384	0.00	2026-04-02 09:13:37.231
NEOGEN	Neogen Chemicals Limited	NSE	Chemicals	\N	1191.10	1182.60	1219.00	1134.50	52657	0.00	2026-04-02 09:13:37.311
NEPHROPLUS	Nephrocare Health Services Limited	NSE	Equities	\N	527.00	528.30	533.00	506.20	33375	0.00	2026-04-02 09:13:37.315
NDRAUTO	Ndr Auto Components Limited	NSE	Equities	\N	657.50	664.15	668.45	631.00	9846	0.00	2026-04-02 09:13:34.361
NIMBSPROJ	Nimbus Projects Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
NIRAJISPAT	Niraj Ispat Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.569122
NORBTEAEXP	Norben Tea & Exports Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
OMKARCHEM	Omkar Speciality Chemicals Limited	NSE	Chemicals	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
NRL	Nupur Recyclers Limited	NSE	Equities	\N	48.81	48.17	49.45	47.73	13460	0.00	2026-04-02 09:13:37.517
OPTIEMUS	Optiemus Infracom Limited	NSE	Equities	\N	301.45	308.50	308.00	292.00	180187	0.00	2026-04-02 09:13:40.282
ORBTEXP	Orbit Exports Limited	NSE	Equities	\N	151.45	147.24	152.75	143.01	1256	0.00	2026-04-02 09:13:40.285
ORCHASP	Orchasp Limited	NSE	Equities	\N	2.14	2.13	2.19	2.02	93063	0.00	2026-04-02 09:13:40.287
NEXTMEDIA	Next Mediaworks Limited	NSE	Equities	\N	3.91	3.97	4.08	3.48	22651	0.00	2026-04-02 09:13:37.438
NFL	National Fertilizers Limited	NSE	Chemicals	\N	68.29	69.44	69.21	66.50	968546	0.00	2026-04-02 09:13:37.441
NGIL	Nakoda Group of Industries Limited	NSE	Equities	\N	25.53	26.00	25.99	24.81	11709	0.00	2026-04-02 09:13:37.443
NGLFINE	NGL Fine-Chem Limited	NSE	Equities	\N	2118.80	2081.20	2137.90	2021.30	1823	0.00	2026-04-02 09:13:37.447
NH	Narayana Hrudayalaya Ltd.	NSE	Equities	\N	1613.00	1635.20	1629.00	1589.00	230418	0.00	2026-04-02 09:13:37.449
NHPC	NHPC Limited	NSE	Equities	\N	74.72	75.39	74.96	73.11	7470507	0.00	2026-04-02 09:13:37.451
NIACL	The New India Assurance Company Limited	NSE	Equities	\N	122.05	123.67	123.37	118.27	365657	0.00	2026-04-02 09:13:37.453
NIBE	NIBE Limited	NSE	Equities	\N	902.65	894.55	914.80	854.45	46580	0.00	2026-04-02 09:13:37.456
NIITLTD	NIIT Limited	NSE	Equities	\N	56.50	55.73	58.39	52.83	686393	0.00	2026-04-02 09:13:37.461
NIITMTS	NIIT Learning Systems Limited	NSE	Equities	\N	272.35	272.65	277.35	263.45	288183	0.00	2026-04-02 09:13:37.464
NILAINFRA	Nila Infrastructures Limited	NSE	Equities	\N	6.80	6.44	7.00	6.21	451523	0.00	2026-04-02 09:13:37.466
NILASPACES	Nila Spaces Limited	NSE	Equities	\N	13.28	13.18	13.54	12.77	464323	0.00	2026-04-02 09:13:37.469
NILKAMAL	Nilkamal Limited	NSE	Equities	\N	1197.30	1159.70	1236.10	1132.60	7992	0.00	2026-04-02 09:13:37.472
NINSYS	NINtec Systems Limited	NSE	Equities	\N	384.05	395.40	394.80	365.05	9772	0.00	2026-04-02 09:13:37.474
NIRAJ	Niraj Cement Structurals Limited	NSE	Equities	\N	23.44	22.49	23.44	21.59	55678	0.00	2026-04-02 09:13:37.479
NITCO	Nitco Limited	NSE	Equities	\N	86.68	87.11	87.40	81.97	271213	0.00	2026-04-02 09:13:37.482
NITINSPIN	Nitin Spinners Limited	NSE	Equities	\N	376.40	363.00	378.25	352.55	81442	0.00	2026-04-02 09:13:37.484
NITIRAJ	Nitiraj Engineers Limited	NSE	Equities	\N	211.95	212.34	211.95	201.00	1107	0.00	2026-04-02 09:13:37.487
NIVABUPA	Niva Bupa Health Insurance Company Limited	NSE	Financial Services	\N	72.08	72.36	72.18	70.00	194148	0.00	2026-04-02 09:13:37.49
NKIND	NK Industries Limited	NSE	Equities	\N	61.00	61.00	62.52	58.00	22	0.00	2026-04-02 09:13:37.492
NLCINDIA	NLC India Limited	NSE	Equities	\N	276.30	283.20	280.00	272.35	1754467	0.00	2026-04-02 09:13:37.494
NOCIL	NOCIL Limited	NSE	Equities	\N	163.31	163.71	166.31	156.59	1078841	0.00	2026-04-02 09:13:37.5
NOIDATOLL	Noida Toll Bridge Company Limited	NSE	Equities	\N	3.17	3.13	3.28	3.00	34584	0.00	2026-04-02 09:13:37.502
NORTHARC	Northern Arc Capital Limited	NSE	Equities	\N	217.68	216.95	219.71	208.11	252184	0.00	2026-04-02 09:13:37.505
NOVAAGRI	Nova Agritech Limited	NSE	Information Technology	\N	23.75	22.10	24.90	20.61	759410	0.00	2026-04-02 09:13:37.507
NRAIL	N R Agarwal Industries Limited	NSE	Equities	\N	410.60	423.55	422.90	408.00	2841	0.00	2026-04-02 09:13:37.512
NRBBEARING	NRB Bearing Limited	NSE	Equities	\N	231.12	237.06	234.00	224.57	111009	0.00	2026-04-02 09:13:37.514
NSIL	Nalwa Sons Investments Limited	NSE	Equities	\N	5064.00	5091.40	5101.40	4890.00	2427	0.00	2026-04-02 09:13:37.519
NSLNISP	NMDC Steel Limited	NSE	Metals & Mining	\N	35.14	35.43	35.45	34.21	1949287	0.00	2026-04-02 09:13:37.522
NTPC	NTPC Limited	NSE	Equities	\N	357.40	364.65	360.95	352.00	13918694	0.00	2026-04-02 09:13:37.525
NTPCGREEN	NTPC Green Energy Limited	NSE	Energy	\N	97.93	98.21	99.00	95.40	4450789	0.00	2026-04-02 09:13:37.528
NUCLEUS	Nucleus Software Exports Limited	NSE	Information Technology	\N	795.00	775.05	802.90	749.90	23334	0.00	2026-04-02 09:13:37.531
NURECA	Nureca Limited	NSE	Equities	\N	234.16	227.42	234.98	216.00	15525	0.00	2026-04-02 09:13:37.533
NUVOCO	Nuvoco Vistas Corporation Limited	NSE	Equities	\N	288.00	290.20	289.90	279.90	51172	0.00	2026-04-02 09:13:37.539
NYKAA	FSN E-Commerce Ventures Limited	NSE	Equities	\N	242.57	239.97	244.00	233.01	4634959	0.00	2026-04-02 09:13:37.541
OAL	Oriental Aromatics Limited	NSE	Equities	\N	247.94	245.44	248.99	240.35	7340	0.00	2026-04-02 09:13:40.227
OBCL	Orissa Bengal Carrier Limited	NSE	Equities	\N	56.06	56.70	58.90	55.60	1374	0.00	2026-04-02 09:13:40.23
OBEROIRLTY	Oberoi Realty Limited	NSE	Real Estate	\N	1492.20	1474.50	1499.80	1414.00	711472	0.00	2026-04-02 09:13:40.234
OCCLLTD	OCCL Limited	NSE	Equities	\N	88.50	86.86	88.80	83.38	84700	0.00	2026-04-02 09:13:40.237
OFSS	Oracle Financial Services Software Limited	NSE	Information Technology	\N	6975.50	6883.00	7019.50	6705.00	117115	0.00	2026-04-02 09:13:40.242
OIL	Oil India Limited	NSE	Equities	\N	477.10	473.40	480.80	463.20	4633252	0.00	2026-04-02 09:13:40.244
OILCOUNTUB	Oil Country Tubular Limited	NSE	Equities	\N	39.13	39.22	39.40	37.56	38103	0.00	2026-04-02 09:13:40.247
OLAELEC	Ola Electric Mobility Limited	NSE	Equities	\N	28.04	25.89	28.55	25.06	375388660	0.00	2026-04-02 09:13:40.25
OLECTRA	Olectra Greentech Limited	NSE	Information Technology	\N	1012.20	1025.85	1022.00	987.00	473896	0.00	2026-04-02 09:13:40.253
OMAXAUTO	Omax Autos Limited	NSE	Equities	\N	100.39	99.14	100.39	96.06	9314	0.00	2026-04-02 09:13:40.256
OMAXE	Omaxe Limited	NSE	Equities	\N	71.45	69.95	71.98	67.47	75498	0.00	2026-04-02 09:13:40.259
OMINFRAL	OM INFRA LIMITED	NSE	Equities	\N	85.68	84.96	86.30	81.12	51866	0.00	2026-04-02 09:13:40.263
OMNI	Omnitech Engineering Limited	NSE	Information Technology	\N	276.00	272.77	310.14	262.00	4676291	0.00	2026-04-02 09:13:40.266
ONELIFECAP	Onelife Capital Advisors Limited	NSE	Equities	\N	15.40	15.40	15.65	15.10	46239	0.00	2026-04-02 09:13:40.268
ONEPOINT	One Point One Solutions Limited	NSE	Equities	\N	45.10	44.03	45.75	42.17	675472	0.00	2026-04-02 09:13:40.27
ONESOURCE	Onesource Specialty Pharma Limited	NSE	Pharmaceuticals	\N	1418.00	1436.40	1432.10	1376.20	89528	0.00	2026-04-02 09:13:40.273
ONMOBILE	OnMobile Global Limited	NSE	Equities	\N	43.10	43.38	43.90	41.30	150111	0.00	2026-04-02 09:13:40.277
ORTEL	Ortel Communications Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
ORTINGLOBE	ORTIN GLOBAL LIMITED	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PANACHE	Panache Digilife Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PARASPETRO	Paras Petrofils Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PIDILITIND	Pidilite Industries Limited	NSE	Equities	\N	1271.10	1307.00	1297.70	1268.70	504601	0.00	2026-04-02 09:13:43.324
PIGL	Power & Instrumentation (Gujarat) Limited	NSE	Equities	\N	107.05	103.42	107.10	101.01	21999	0.00	2026-04-02 09:13:43.326
ORICONENT	Oricon Enterprises Limited	NSE	Equities	\N	65.40	64.25	66.18	63.46	328441	0.00	2026-04-02 09:13:40.294
ORIENTBELL	Orient Bell Limited	NSE	Equities	\N	261.95	258.00	261.95	250.00	5389	0.00	2026-04-02 09:13:40.299
ORIENTCEM	Orient Cement Limited	NSE	Equities	\N	130.76	131.20	132.55	126.27	189208	0.00	2026-04-02 09:13:40.301
ORIENTCER	ORIENT CERATECH LIMITED	NSE	Information Technology	\N	38.02	36.78	39.00	36.07	99426	0.00	2026-04-02 09:13:40.303
ORIENTELEC	Orient Electric Limited	NSE	Equities	\N	159.38	160.17	159.70	155.88	75206	0.00	2026-04-02 09:13:40.306
ORIENTHOT	Oriental Hotels Limited	NSE	Equities	\N	88.71	89.01	89.99	86.24	53622	0.00	2026-04-02 09:13:40.308
ORIENTLTD	Orient Press Limited	NSE	Equities	\N	59.75	60.69	62.00	58.35	573	0.00	2026-04-02 09:13:40.31
ORIENTTECH	Orient Technologies Limited	NSE	Information Technology	\N	250.94	255.55	258.88	242.77	339612	0.00	2026-04-02 09:13:40.316
ORKLAINDIA	Orkla India Limited	NSE	Equities	\N	606.65	599.45	609.00	580.55	57247	0.00	2026-04-02 09:13:40.32
OSIAHYPER	Osia Hyper Retail Limited	NSE	Equities	\N	3.52	3.70	3.52	3.52	468232	0.00	2026-04-02 09:13:40.322
OSWALAGRO	Oswal Agro Mills Limited	NSE	Equities	\N	40.70	40.46	41.49	37.32	91517	0.00	2026-04-02 09:13:40.325
OSWALGREEN	Oswal Greentech Limited	NSE	Information Technology	\N	23.17	22.83	23.39	21.71	195223	0.00	2026-04-02 09:13:40.327
OSWALPUMPS	Oswal Pumps Limited	NSE	Equities	\N	308.45	309.70	313.95	297.00	585124	0.00	2026-04-02 09:13:40.33
PACEDIGITK	Pace Digitek Limited	NSE	Equities	\N	152.62	153.62	156.65	150.50	1174615	0.00	2026-04-02 09:13:40.339
PAGEIND	Page Industries Limited	NSE	Equities	\N	33765.00	32620.00	33980.00	32225.00	63873	0.00	2026-04-02 09:13:40.341
PAISALO	Paisalo Digital Limited	NSE	Information Technology	\N	34.74	35.36	35.14	34.41	3443851	0.00	2026-04-02 09:13:40.344
PAKKA	PAKKA LIMITED	NSE	Equities	\N	86.87	86.18	87.45	84.01	68515	0.00	2026-04-02 09:13:40.347
PALASHSECU	Palash Securities Limited	NSE	Equities	\N	83.75	83.70	83.75	82.60	129	0.00	2026-04-02 09:13:40.349
PANACEABIO	Panacea Biotec Limited	NSE	Equities	\N	321.85	325.30	327.00	315.00	48888	0.00	2026-04-02 09:13:40.354
PANAMAPET	Panama Petrochem Limited	NSE	Chemicals	\N	264.50	255.72	266.79	255.00	21917	0.00	2026-04-02 09:13:40.357
PANSARI	Pansari Developers Limited	NSE	Equities	\N	253.40	253.40	259.90	253.40	57	0.00	2026-04-02 09:13:43.229
PAR	Par Drugs And Chemicals Limited	NSE	Pharmaceuticals	\N	82.99	82.63	83.00	80.20	6255	0.00	2026-04-02 09:13:43.232
PARACABLES	Paramount Communications Limited	NSE	Equities	\N	32.03	31.95	32.26	30.43	838245	0.00	2026-04-02 09:13:43.235
PARADEEP	Paradeep Phosphates Limited	NSE	Equities	\N	114.70	115.92	115.76	110.10	4590207	0.00	2026-04-02 09:13:43.237
PARAGMILK	Parag Milk Foods Limited	NSE	Equities	\N	191.28	192.51	194.20	184.49	742556	0.00	2026-04-02 09:13:43.24
PARKHOSPS	Park Medi World Limited	NSE	Equities	\N	197.31	198.03	201.65	192.50	483215	0.00	2026-04-02 09:13:43.245
PARKHOTELS	Apeejay Surrendra Park Hotels Limited	NSE	Equities	\N	106.46	106.25	108.46	102.22	227290	0.00	2026-04-02 09:13:43.247
PARSVNATH	Parsvnath Developers Limited	NSE	Equities	\N	5.93	6.09	6.00	5.55	826952	0.00	2026-04-02 09:13:43.25
PASHUPATI	Pashupati Cotspin Limited	NSE	Equities	\N	985.30	985.40	1012.60	967.05	1138	0.00	2026-04-02 09:13:43.252
PASUPTAC	Pasupati Acrylon Limited	NSE	Equities	\N	43.74	44.46	44.10	42.69	99669	0.00	2026-04-02 09:13:43.255
PATANJALI	Patanjali Foods Limited	NSE	Equities	\N	464.50	470.10	469.25	457.60	1408846	0.00	2026-04-02 09:13:43.258
PATELENG	Patel Engineering Limited	NSE	Equities	\N	24.08	24.03	24.30	22.70	4977895	0.00	2026-04-02 09:13:43.26
PATELRMART	Patel Retail Limited	NSE	Equities	\N	163.56	165.09	165.79	159.06	144181	0.00	2026-04-02 09:13:43.263
PAUSHAKLTD	Paushak Limited	NSE	Equities	\N	400.20	383.40	408.40	372.40	23813	0.00	2026-04-02 09:13:43.268
PAVNAIND	Pavna Industries Limited	NSE	Equities	\N	15.97	15.86	16.20	14.36	66983	0.00	2026-04-02 09:13:43.27
PAYTM	One 97 Communications Limited	NSE	Equities	\N	996.10	997.10	1002.80	962.00	1631165	0.00	2026-04-02 09:13:43.273
PCBL	PCBL Chemical Limited	NSE	Chemicals	\N	253.89	257.62	257.11	246.34	1363727	0.00	2026-04-02 09:13:43.276
PCJEWELLER	PC Jeweller Limited	NSE	Equities	\N	8.19	8.25	8.36	7.90	28820355	0.00	2026-04-02 09:13:43.278
PDMJEPAPER	Pudumjee Paper Products Limited	NSE	Equities	\N	71.75	70.88	73.50	68.02	125333	0.00	2026-04-02 09:13:43.28
PDSL	PDS Limited	NSE	Equities	\N	280.30	278.45	286.55	264.00	82612	0.00	2026-04-02 09:13:43.282
PENIND	Pennar Industries Limited	NSE	Equities	\N	144.53	144.29	146.80	139.34	496244	0.00	2026-04-02 09:13:43.287
PENINLAND	Peninsula Land Limited	NSE	Equities	\N	16.50	16.50	16.89	15.81	247847	0.00	2026-04-02 09:13:43.29
PERSISTENT	Persistent Systems Limited	NSE	Equities	\N	5227.40	5049.10	5267.00	4963.90	802819	0.00	2026-04-02 09:13:43.292
PETRONET	Petronet LNG Limited	NSE	Equities	\N	253.44	257.88	256.00	247.09	1761347	0.00	2026-04-02 09:13:43.295
PFC	Power Finance Corporation Limited	NSE	Equities	\N	398.50	397.70	401.05	382.25	7600125	0.00	2026-04-02 09:13:43.298
PFIZER	Pfizer Limited	NSE	Equities	\N	4894.60	4853.00	4909.40	4740.10	19580	0.00	2026-04-02 09:13:43.301
PFS	PTC India Financial Services Limited	NSE	Equities	\N	26.17	26.58	26.53	25.55	369474	0.00	2026-04-02 09:13:43.305
PGEL	PG Electroplast Limited	NSE	Equities	\N	448.10	480.90	474.95	443.05	5999928	0.00	2026-04-02 09:13:43.308
PGHH	Procter & Gamble Hygiene and Health Care Limited	NSE	Healthcare	\N	9677.50	9748.00	9748.00	9444.00	8182	0.00	2026-04-02 09:13:43.311
PGHL	Procter & Gamble Health Limited	NSE	Equities	\N	4783.30	4809.40	4806.00	4728.00	10840	0.00	2026-04-02 09:13:43.314
PGIL	Pearl Global Industries Limited	NSE	Equities	\N	1471.40	1453.20	1477.00	1403.00	14219	0.00	2026-04-02 09:13:43.316
PICCADIL	Piccadily Agro Industries Limited	NSE	Equities	\N	536.00	541.45	541.00	523.85	49350	0.00	2026-04-02 09:13:43.32
PRECOT	Precot Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PREMIER	Premier Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PREMIERPOL	Premier Polyfilm Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.591707
PTCIL	PTC Industries Limited	NSE	Equities	\N	14664.00	15030.00	14950.00	14499.00	12770	0.00	2026-04-02 09:13:49.236
PUNJABCHEM	Punjab Chemicals & Crop Protection Limited	NSE	Chemicals	\N	939.75	928.35	953.85	911.30	3754	0.00	2026-04-02 09:13:49.241
PURVA	Puravankara Limited	NSE	Equities	\N	176.28	175.77	177.95	168.10	110743	0.00	2026-04-02 09:13:49.244
PIIND	PI Industries Limited	NSE	Equities	\N	2770.50	2844.90	2806.50	2724.00	168832	0.00	2026-04-02 09:13:43.329
PILANIINVS	Pilani Investment and Industries Corporation Limited	NSE	Equities	\N	4410.80	4410.50	4437.80	4228.10	1229	0.00	2026-04-02 09:13:43.331
PILITA	PIL ITALICA LIFESTYLE LIMITED	NSE	Equities	\N	7.00	7.01	7.05	6.80	32448	0.00	2026-04-02 09:13:43.333
PINELABS	Pine Labs Limited	NSE	Equities	\N	152.25	156.54	156.00	152.11	288904	0.00	2026-04-02 09:13:43.335
PIONEEREMB	Pioneer Embroideries Limited	NSE	Equities	\N	21.69	21.75	21.89	20.81	7059	0.00	2026-04-02 09:13:43.338
PIRAMALFIN	Piramal Finance Limited	NSE	Equities	\N	1765.40	1793.30	1775.00	1730.00	113057	0.00	2026-04-02 09:13:43.34
PIXTRANS	Pix Transmissions Limited	NSE	Equities	\N	1454.70	1462.10	1462.20	1434.40	4430	0.00	2026-04-02 09:13:43.345
PKTEA	The Peria Karamalai Tea & Produce Company Limited	NSE	Equities	\N	845.00	840.00	878.00	840.00	67	0.00	2026-04-02 09:13:43.347
PLASTIBLEN	Plastiblends India Limited	NSE	Equities	\N	129.00	126.00	130.50	125.09	4071	0.00	2026-04-02 09:13:43.349
PLATIND	Platinum Industries Limited	NSE	Equities	\N	197.13	200.90	200.99	192.10	66436	0.00	2026-04-02 09:13:43.352
PLAZACABLE	Plaza Wires Limited	NSE	Equities	\N	32.50	32.00	32.81	31.02	62896	0.00	2026-04-02 09:13:46.232
PNB	Punjab National Bank	NSE	Banking	\N	103.09	104.00	104.10	99.79	17593937	0.00	2026-04-02 09:13:46.235
PNBGILTS	PNB Gilts Limited	NSE	Equities	\N	63.84	64.06	64.00	61.80	287573	0.00	2026-04-02 09:13:46.239
PNC	Pritish Nandy Communications Limited	NSE	Equities	\N	19.37	18.69	19.55	17.70	8192	0.00	2026-04-02 09:13:46.244
PNCINFRA	PNC Infratech Limited	NSE	Information Technology	\N	171.98	172.38	173.60	164.15	272252	0.00	2026-04-02 09:13:46.247
PNGJL	P N Gadgil Jewellers Limited	NSE	Equities	\N	556.60	561.35	559.45	541.10	61252	0.00	2026-04-02 09:13:46.249
PNGSREVA	PNGS Reva Diamond Jewellery Limited	NSE	Consumer Goods	\N	345.55	342.10	351.90	327.75	28053	0.00	2026-04-02 09:13:46.253
POCL	Pondy Oxides & Chemicals Limited	NSE	Chemicals	\N	1078.60	1099.90	1095.00	1053.70	91541	0.00	2026-04-02 09:13:46.255
POKARNA	Pokarna Limited	NSE	Equities	\N	863.00	869.70	875.00	838.00	33015	0.00	2026-04-02 09:13:46.314
POLICYBZR	PB Fintech Limited	NSE	Information Technology	\N	1413.30	1433.10	1427.30	1390.50	570288	0.00	2026-04-02 09:13:46.317
POLYCAB	Polycab India Limited	NSE	Equities	\N	6848.00	6925.00	6906.00	6690.50	292946	0.00	2026-04-02 09:13:46.319
POLYMED	Poly Medicure Limited	NSE	Equities	\N	1330.80	1283.20	1363.40	1236.00	283246	0.00	2026-04-02 09:13:46.321
POLYPLEX	Polyplex Corporation Limited	NSE	Equities	\N	790.00	791.70	797.50	758.75	44469	0.00	2026-04-02 09:13:46.324
PONNIERODE	Ponni Sugars (Erode) Limited	NSE	Equities	\N	279.20	282.85	283.00	274.80	14685	0.00	2026-04-02 09:13:46.327
POWERICA	Powerica Limited	NSE	Equities	\N	391.95	395.00	397.00	365.10	3663854	0.00	2026-04-02 09:13:46.335
POWERINDIA	Hitachi Energy India Limited	NSE	Equities	\N	25065.00	25065.00	25310.00	24180.00	90098	0.00	2026-04-02 09:13:46.337
POWERMECH	Power Mech Projects Limited	NSE	Equities	\N	1899.80	1875.80	1917.60	1805.40	96471	0.00	2026-04-02 09:13:46.34
PPAP	PPAP Automotive Limited	NSE	Equities	\N	190.74	190.49	191.00	182.00	8279	0.00	2026-04-02 09:13:46.343
PPL	Prakash Pipes Limited	NSE	Equities	\N	180.00	180.52	182.63	172.50	76430	0.00	2026-04-02 09:13:46.346
PPLPHARMA	Piramal Pharma Limited	NSE	Pharmaceuticals	\N	141.00	142.51	141.40	136.26	1827029	0.00	2026-04-02 09:13:46.349
PRABHA	Prabha Energy Limited	NSE	Equities	\N	156.50	153.11	157.80	148.00	70510	0.00	2026-04-02 09:13:46.351
PRAJIND	Praj Industries Limited	NSE	Equities	\N	327.00	326.20	332.90	317.30	1727827	0.00	2026-04-02 09:13:46.357
PRAKASH	Prakash Industries Limited	NSE	Equities	\N	121.74	120.48	124.31	116.25	498785	0.00	2026-04-02 09:13:46.359
PRAKASHSTL	Prakash Steelage Limited	NSE	Metals & Mining	\N	4.12	4.06	4.15	4.01	39326	0.00	2026-04-02 09:13:46.362
PRAXIS	Praxis Home Retail Limited	NSE	Equities	\N	5.80	5.53	5.80	5.49	15285	0.00	2026-04-02 09:13:46.365
PRECAM	Precision Camshafts Limited	NSE	Equities	\N	117.28	117.51	120.18	110.81	357014	0.00	2026-04-02 09:13:46.368
PREMEXPLN	Premier Explosives Limited	NSE	Equities	\N	422.40	419.65	430.20	401.00	211872	0.00	2026-04-02 09:13:46.373
PREMIERENE	Premier Energies Limited	NSE	Equities	\N	911.10	937.70	931.30	894.05	1336551	0.00	2026-04-02 09:13:46.376
PRESTIGE	Prestige Estates Projects Limited	NSE	Equities	\N	1133.30	1144.90	1150.10	1090.00	1727547	0.00	2026-04-02 09:13:46.379
PRICOLLTD	Pricol Limited	NSE	Equities	\N	523.90	537.90	536.90	517.50	144665	0.00	2026-04-02 09:13:46.381
PRIMESECU	Prime Securities Limited	NSE	Equities	\N	269.20	277.20	276.75	264.15	21044	0.00	2026-04-02 09:13:46.384
PRIMO	Primo Chemicals Limited	NSE	Chemicals	\N	20.89	19.15	21.00	19.12	205712	0.00	2026-04-02 09:13:46.386
PRITI	Priti International Limited	NSE	Equities	\N	35.10	35.47	35.82	34.00	4867	0.00	2026-04-02 09:13:46.392
PRITIKAUTO	Pritika Auto Industries Limited	NSE	Equities	\N	11.76	11.51	12.05	11.08	141329	0.00	2026-04-02 09:13:46.394
PRIVISCL	Privi Speciality Chemicals Limited	NSE	Chemicals	\N	2924.60	2931.00	2962.80	2865.70	47107	0.00	2026-04-02 09:13:46.397
PROSTARM	Prostarm Info Systems Limited	NSE	Equities	\N	125.03	124.38	126.50	120.00	155493	0.00	2026-04-02 09:13:46.399
PROTEAN	Protean eGov Technologies Limited	NSE	Information Technology	\N	484.85	490.95	490.95	471.10	189265	0.00	2026-04-02 09:13:46.401
PROZONER	Prozone Realty Limited	NSE	Real Estate	\N	46.90	45.10	49.75	44.00	288339	0.00	2026-04-02 09:13:46.404
PRUDENT	Prudent Corporate Advisory Services Limited	NSE	Equities	\N	2225.50	2262.70	2233.10	2173.70	10125	0.00	2026-04-02 09:13:46.41
PRUDMOULI	Prudential Sugar Corporation Limited	NSE	Equities	\N	12.20	11.82	12.36	11.83	6499	0.00	2026-04-02 09:13:46.413
PSB	Punjab & Sind Bank	NSE	Banking	\N	22.09	22.03	22.25	21.24	1399576	0.00	2026-04-02 09:13:46.416
PSPPROJECT	PSP Projects Limited	NSE	Equities	\N	628.40	621.90	634.00	602.15	22646	0.00	2026-04-02 09:13:46.419
PTC	PTC India Limited	NSE	Equities	\N	164.70	167.32	166.01	161.71	510538	0.00	2026-04-02 09:13:49.232
RAJESHEXPO	Rajesh Exports Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
RAJRILTD	Raj Rayon Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
RCOM	Reliance Communications Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
RELINFRA	Reliance Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
RGL	Renaissance Global Limited	NSE	Equities	\N	101.25	101.82	102.88	97.13	532524	0.00	2026-04-02 09:13:52.282
PVP	PVP Ventures Limited	NSE	Equities	\N	24.11	24.72	25.04	23.91	162017	0.00	2026-04-02 09:13:49.246
PVRINOX	PVR INOX Limited	NSE	Equities	\N	940.40	945.05	947.60	915.05	144400	0.00	2026-04-02 09:13:49.248
PVSL	Popular Vehicles and Services Limited	NSE	Equities	\N	91.69	92.39	92.41	87.02	21869	0.00	2026-04-02 09:13:49.251
PWL	Physicswallah Limited	NSE	Equities	\N	89.58	89.00	90.23	85.95	2129209	0.00	2026-04-02 09:13:49.254
QUADFUTURE	Quadrant Future Tek Limited	NSE	Equities	\N	287.15	286.10	289.95	276.90	100849	0.00	2026-04-02 09:13:49.262
QUESS	Quess Corp Limited	NSE	Equities	\N	177.73	176.30	179.51	170.10	83671	0.00	2026-04-02 09:13:49.265
QUICKHEAL	Quick Heal Technologies Limited	NSE	Information Technology	\N	139.76	143.61	142.40	135.00	214809	0.00	2026-04-02 09:13:49.268
RACE	Race Eco Chain Limited	NSE	Equities	\N	116.01	103.26	123.00	101.45	221071	0.00	2026-04-02 09:13:49.27
RACLGEAR	RACL Geartech Limited	NSE	Information Technology	\N	1260.00	1225.80	1269.50	1181.80	11353	0.00	2026-04-02 09:13:49.272
RADAAN	Radaan Mediaworks India Limited	NSE	Equities	\N	2.79	2.80	2.97	2.70	29264	0.00	2026-04-02 09:13:49.276
RADIANTCMS	Radiant Cash Management Services Limited	NSE	Equities	\N	38.34	37.91	39.50	36.71	290071	0.00	2026-04-02 09:13:49.281
RADICO	Radico Khaitan Limited	NSE	Equities	\N	2626.90	2684.00	2664.50	2587.20	221583	0.00	2026-04-02 09:13:49.283
RADIOCITY	Music Broadcast Limited	NSE	Equities	\N	5.29	5.03	5.41	4.80	195789	0.00	2026-04-02 09:13:49.286
RAILTEL	Railtel Corporation Of India Limited	NSE	Equities	\N	260.36	263.78	262.80	252.60	792620	0.00	2026-04-02 09:13:49.289
RAIN	Rain Industries Limited	NSE	Equities	\N	111.76	114.88	113.16	109.50	2409124	0.00	2026-04-02 09:13:49.292
RAINBOW	Rainbow Childrens Medicare Limited	NSE	Healthcare	\N	1147.00	1175.20	1175.20	1120.50	134843	0.00	2026-04-02 09:13:49.294
RAJOOENG	Rajoo Engineers Limited	NSE	Equities	\N	52.29	52.13	53.09	49.15	682387	0.00	2026-04-02 09:13:49.3
RAJRATAN	Rajratan Global Wire Limited	NSE	Equities	\N	365.50	362.55	372.55	350.05	71201	0.00	2026-04-02 09:13:49.302
RAJSREESUG	Rajshree Sugars & Chemicals Limited	NSE	Chemicals	\N	27.97	28.06	28.39	27.30	67493	0.00	2026-04-02 09:13:49.305
RAJTV	Raj Television Network Limited	NSE	Equities	\N	35.90	34.74	35.90	34.38	426	0.00	2026-04-02 09:13:49.307
RALLIS	Rallis India Limited	NSE	Equities	\N	233.20	233.45	237.65	223.37	289213	0.00	2026-04-02 09:13:49.309
RAMANEWS	Shree Rama Newsprint Limited	NSE	Equities	\N	30.43	30.23	30.51	29.80	39285	0.00	2026-04-02 09:13:49.312
RAMASTEEL	Rama Steel Tubes Limited	NSE	Metals & Mining	\N	4.09	3.99	4.26	3.74	24856287	0.00	2026-04-02 09:13:49.316
RAMCOCEM	The Ramco Cements Limited	NSE	Equities	\N	921.00	943.50	929.05	904.15	78050	0.00	2026-04-02 09:13:49.319
RAMCOIND	Ramco Industries Limited	NSE	Equities	\N	250.95	246.83	253.20	241.45	48965	0.00	2026-04-02 09:13:49.322
RAMCOSYS	Ramco Systems Limited	NSE	Equities	\N	361.05	363.25	363.95	346.55	44142	0.00	2026-04-02 09:13:49.325
RAMKY	Ramky Infrastructure Limited	NSE	Equities	\N	448.30	456.35	451.40	438.00	39248	0.00	2026-04-02 09:13:49.327
RAMRAT	Ram Ratna Wires Limited	NSE	Equities	\N	301.00	302.40	304.75	286.60	53256	0.00	2026-04-02 09:13:49.33
RANEHOLDIN	Rane Holdings Limited	NSE	Equities	\N	1036.25	1044.50	1050.00	1015.10	2992	0.00	2026-04-02 09:13:49.335
RATEGAIN	Rategain Travel Technologies Limited	NSE	Information Technology	\N	491.15	479.65	495.00	460.95	363895	0.00	2026-04-02 09:13:49.337
RATNAMANI	Ratnamani Metals & Tubes Limited	NSE	Equities	\N	2241.00	2256.20	2265.80	2148.00	26773	0.00	2026-04-02 09:13:49.34
RATNAVEER	Ratnaveer Precision Engineering Limited	NSE	Equities	\N	138.66	138.11	140.50	134.81	264931	0.00	2026-04-02 09:13:49.342
RAYMOND	Raymond Limited	NSE	Equities	\N	346.20	350.80	351.00	333.95	301474	0.00	2026-04-02 09:13:49.345
RAYMONDREL	Raymond Realty Limited	NSE	Real Estate	\N	398.00	399.25	403.40	383.30	174483	0.00	2026-04-02 09:13:49.35
RBA	Restaurant Brands Asia Limited	NSE	Equities	\N	60.35	59.10	61.50	58.01	1230772	0.00	2026-04-02 09:13:49.353
RBLBANK	RBL Bank Limited	NSE	Banking	\N	298.45	301.65	301.20	292.20	6188765	0.00	2026-04-02 09:13:49.355
RBZJEWEL	RBZ Jewellers Limited	NSE	Equities	\N	121.98	116.00	127.00	112.10	70396	0.00	2026-04-02 09:13:49.358
RCF	Rashtriya Chemicals and Fertilizers Limited	NSE	Chemicals	\N	113.90	115.79	115.45	110.41	1602183	0.00	2026-04-02 09:13:49.361
RECLTD	REC Limited	NSE	Equities	\N	321.70	322.10	324.30	311.25	6716565	0.00	2026-04-02 09:13:52.232
REDTAPE	Redtape Limited	NSE	Equities	\N	113.82	114.87	114.50	110.65	197123	0.00	2026-04-02 09:13:52.237
REFEX	Refex Industries Limited	NSE	Equities	\N	201.00	202.61	204.99	194.84	284872	0.00	2026-04-02 09:13:52.24
REGAAL	Regaal Resources Limited	NSE	Equities	\N	67.49	64.28	67.49	62.81	605101	0.00	2026-04-02 09:13:52.243
REGENCERAM	Regency Ceramics Limited	NSE	Equities	\N	39.08	40.33	41.14	38.62	622	0.00	2026-04-02 09:13:52.245
RELAXO	Relaxo Footwears Limited	NSE	Equities	\N	265.65	260.44	269.75	250.44	155450	0.00	2026-04-02 09:13:52.248
RELIABLE	Reliable Data Services Limited	NSE	Information Technology	\N	118.64	119.96	119.24	113.50	5832	0.00	2026-04-02 09:13:52.253
RELIGARE	Religare Enterprises Limited	NSE	Equities	\N	219.20	219.53	222.00	209.20	480305	0.00	2026-04-02 09:13:52.257
RELTD	Ravindra Energy Limited	NSE	Equities	\N	129.41	128.82	132.19	125.13	55431	0.00	2026-04-02 09:13:52.26
REMSONSIND	Remsons Industries Limited	NSE	Equities	\N	89.42	88.95	90.39	83.65	37702	0.00	2026-04-02 09:13:52.262
RENUKA	Shree Renuka Sugars Limited	NSE	Equities	\N	27.95	28.09	28.55	27.05	9634858	0.00	2026-04-02 09:13:52.265
REPCOHOME	Repco Home Finance Limited	NSE	Equities	\N	362.25	363.75	365.00	351.95	62056	0.00	2026-04-02 09:13:52.268
REPRO	Repro India Limited	NSE	Equities	\N	357.60	347.20	361.95	331.60	9133	0.00	2026-04-02 09:13:52.273
RESPONIND	Responsive Industries Limited	NSE	Equities	\N	125.10	129.59	127.73	117.25	382592	0.00	2026-04-02 09:13:52.275
RETAIL	JHS Svendgaard Retail Ventures Limited	NSE	Equities	\N	17.89	18.48	18.60	16.41	338	0.00	2026-04-02 09:13:52.279
RMC	RMC Switchgears Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
RNBDENIMS	R&B Denims Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
ROLLT	Rollatainers Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
S&SPOWER	S&S Power Switchgears Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SABEVENTS	Sab Events & Governance Now Media Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SADBHAV	Sadbhav Engineering Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SALASAR	Salasar Techno Engineering Limited	NSE	Information Technology	\N	6.34	6.24	6.40	5.95	4588652	0.00	2026-04-02 09:13:55.332
SALONA	Salona Cotspin Limited	NSE	Equities	\N	273.00	264.15	274.90	262.75	463	0.00	2026-04-02 09:13:55.336
RICOAUTO	Rico Auto Industries Limited	NSE	Equities	\N	107.16	108.49	108.68	103.20	1057964	0.00	2026-04-02 09:13:52.293
RIIL	Reliance Industrial Infrastructure Limited	NSE	Equities	\N	662.40	666.75	670.00	643.40	75315	0.00	2026-04-02 09:13:52.296
RISHABH	Rishabh Instruments Limited	NSE	Equities	\N	382.15	377.05	387.00	351.20	38299	0.00	2026-04-02 09:13:52.3
RITCO	Ritco Logistics Limited	NSE	Equities	\N	175.50	184.17	182.99	167.10	164882	0.00	2026-04-02 09:13:52.302
RITES	RITES Limited	NSE	Equities	\N	188.50	189.41	190.72	182.40	473355	0.00	2026-04-02 09:13:52.304
RKEC	RKEC Projects Limited	NSE	Equities	\N	30.50	29.49	31.24	28.49	20468	0.00	2026-04-02 09:13:52.31
RKFORGE	Ramkrishna Forgings Limited	NSE	Equities	\N	493.15	501.95	498.00	478.25	157730	0.00	2026-04-02 09:13:52.313
RKSWAMY	R K Swamy Limited	NSE	Equities	\N	80.00	74.68	80.90	72.00	46780	0.00	2026-04-02 09:13:52.317
RMDRIP	R M Drip and Sprinklers Systems Limited	NSE	Equities	\N	42.65	41.16	43.21	39.60	1828271	0.00	2026-04-02 09:13:52.321
RML	Rane (Madras) Limited	NSE	Equities	\N	665.50	665.90	673.40	652.00	10939	0.00	2026-04-02 09:13:52.324
ROHLTD	Royal Orchid Hotels Limited	NSE	Equities	\N	310.00	306.45	311.50	291.60	44242	0.00	2026-04-02 09:13:52.327
ROLEXRINGS	Rolex Rings Limited	NSE	Equities	\N	116.93	116.67	117.99	113.00	208847	0.00	2026-04-02 09:13:52.33
ROSSARI	Rossari Biotech Limited	NSE	Information Technology	\N	428.95	404.30	464.45	392.55	450154	0.00	2026-04-02 09:13:52.338
ROSSELLIND	Rossell India Limited	NSE	Equities	\N	44.98	44.12	45.90	43.24	19214	0.00	2026-04-02 09:13:52.342
ROSSTECH	Rossell Techsys Limited	NSE	Information Technology	\N	710.90	708.60	715.00	685.00	21989	0.00	2026-04-02 09:13:52.345
ROTO	Roto Pumps Limited	NSE	Equities	\N	51.94	50.21	52.69	48.00	430285	0.00	2026-04-02 09:13:52.349
ROUTE	ROUTE MOBILE LIMITED	NSE	Equities	\N	457.15	451.30	459.00	434.80	147913	0.00	2026-04-02 09:13:52.351
RPGLIFE	RPG Life Sciences Limited	NSE	Equities	\N	1911.20	1877.60	1930.00	1840.40	3667	0.00	2026-04-02 09:13:52.356
RPOWER	Reliance Power Limited	NSE	Equities	\N	22.34	22.35	22.89	21.18	52883590	0.00	2026-04-02 09:13:52.359
RPPINFRA	R.P.P. Infra Projects Limited	NSE	Equities	\N	63.80	62.52	64.56	58.26	87730	0.00	2026-04-02 09:13:52.361
RPPL	Rajshree Polypack Limited	NSE	Equities	\N	16.00	15.85	16.41	15.30	22213	0.00	2026-04-02 09:13:52.364
RPSGVENT	RPSG VENTURES LIMITED	NSE	Equities	\N	1016.25	946.85	1028.30	896.35	12677813	0.00	2026-04-02 09:13:52.366
RPTECH	Rashi Peripherals Limited	NSE	Equities	\N	362.40	354.95	364.00	344.50	53589	0.00	2026-04-02 09:13:52.369
RRKABEL	R R Kabel Limited	NSE	Equities	\N	1324.50	1333.30	1334.10	1281.30	51953	0.00	2026-04-02 09:13:52.371
RSSOFTWARE	R. S. Software (India) Limited	NSE	Information Technology	\N	24.17	23.02	24.17	23.67	69834	0.00	2026-04-02 09:13:55.233
RSWM	RSWM Limited	NSE	Equities	\N	126.50	128.19	131.95	123.90	39378	0.00	2026-04-02 09:13:55.237
RSYSTEMS	R Systems International Limited	NSE	Equities	\N	264.23	255.24	267.99	246.01	323090	0.00	2026-04-02 09:13:55.24
RTNINDIA	RattanIndia Enterprises Limited	NSE	Equities	\N	28.38	28.61	28.86	27.27	2134541	0.00	2026-04-02 09:13:55.244
RTNPOWER	RattanIndia Power Limited	NSE	Equities	\N	8.17	8.30	8.30	7.94	13635249	0.00	2026-04-02 09:13:55.247
RUBICON	Rubicon Research Limited	NSE	Equities	\N	775.45	782.10	780.00	765.20	48755	0.00	2026-04-02 09:13:55.253
RUBYMILLS	The Ruby Mills Limited	NSE	Equities	\N	207.45	204.15	207.95	201.00	10092	0.00	2026-04-02 09:13:55.256
RUCHINFRA	Ruchi Infrastructure Limited	NSE	Equities	\N	5.94	4.95	5.94	4.95	515671	0.00	2026-04-02 09:13:55.259
RUCHIRA	Ruchira Papers Limited	NSE	Equities	\N	102.49	100.28	102.99	99.22	11309	0.00	2026-04-02 09:13:55.261
RUDRA	Rudra Global Infra Products Limited	NSE	Equities	\N	16.43	15.73	16.70	15.18	72869	0.00	2026-04-02 09:13:55.264
RUPA	Rupa & Company Limited	NSE	Equities	\N	121.72	119.60	122.75	115.82	137549	0.00	2026-04-02 09:13:55.267
RUSHIL	Rushil Decor Limited	NSE	Equities	\N	15.65	14.72	15.68	14.10	315773	0.00	2026-04-02 09:13:55.27
RVHL	Ravinder Heights Limited	NSE	Equities	\N	35.52	34.28	36.89	31.50	26608	0.00	2026-04-02 09:13:55.276
RVNL	Rail Vikas Nigam Limited	NSE	Equities	\N	257.30	262.61	259.47	251.00	5152837	0.00	2026-04-02 09:13:55.279
RVTH	Revathi Equipment India Limited	NSE	Equities	\N	552.50	550.25	572.30	537.95	400	0.00	2026-04-02 09:13:55.282
SAATVIKGL	Saatvik Green Energy Limited	NSE	Energy	\N	399.55	399.55	406.70	386.95	132051	0.00	2026-04-02 09:13:55.286
SADHNANIQ	Sadhana Nitrochem Limited	NSE	Equities	\N	1.50	1.43	1.50	1.45	4640630	0.00	2026-04-02 09:13:55.291
SAFARI	Safari Industries (India) Limited	NSE	Equities	\N	1495.30	1523.10	1507.90	1476.00	14888	0.00	2026-04-02 09:13:55.294
SAGARDEEP	Sagardeep Alloys Limited	NSE	Equities	\N	23.05	22.89	23.17	22.10	4312	0.00	2026-04-02 09:13:55.298
SAGCEM	Sagar Cements Limited	NSE	Equities	\N	164.00	164.63	166.01	156.02	57568	0.00	2026-04-02 09:13:55.302
SAGILITY	SAGILITY LIMITED	NSE	Equities	\N	41.87	41.71	42.38	39.85	14790639	0.00	2026-04-02 09:13:55.305
SAHYADRI	Sahyadri Industries Limited	NSE	Equities	\N	219.99	209.34	222.90	206.64	1563	0.00	2026-04-02 09:13:55.307
SAIL	Steel Authority of India Limited	NSE	Metals & Mining	\N	154.30	155.82	155.48	150.28	22453086	0.00	2026-04-02 09:13:55.31
SAIPARENT	Sai Parenterals Limited	NSE	Equities	\N	404.75	392.00	416.00	400.00	971545	0.00	2026-04-02 09:13:55.318
SAKAR	Sakar Healthcare Limited	NSE	Healthcare	\N	514.40	515.65	519.15	492.20	41893	0.00	2026-04-02 09:13:55.32
SAKHTISUG	Sakthi Sugars Limited	NSE	Equities	\N	14.40	14.51	14.50	14.00	97001	0.00	2026-04-02 09:13:55.323
SAKSOFT	Saksoft Limited	NSE	Equities	\N	122.45	122.94	124.78	117.60	225354	0.00	2026-04-02 09:13:55.325
SAKUMA	Sakuma Exports Limited	NSE	Equities	\N	1.59	1.33	1.59	1.24	4145365	0.00	2026-04-02 09:13:55.328
SANCO	Sanco Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SANGINITA	Sanginita Chemicals Limited	NSE	Chemicals	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SCHNEIDER	Schneider Electric Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SCPL	Sheetal Cool Products Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SETUINFRA	Setubandhan Infrastructure Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SEYAIND	Seya Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SALZERELEC	Salzer Electronics Limited	NSE	Equities	\N	527.70	526.40	534.65	507.85	38623	0.00	2026-04-02 09:13:55.343
SAMBHV	Sambhv Steel Tubes Limited	NSE	Metals & Mining	\N	100.52	100.86	102.39	95.01	1600959	0.00	2026-04-02 09:13:55.347
SAMHI	Samhi Hotels Limited	NSE	Equities	\N	135.68	134.17	136.72	128.22	1016924	0.00	2026-04-02 09:13:55.35
SAMMAANCAP	Sammaan Capital Limited	NSE	Equities	\N	146.61	146.66	147.99	141.96	13902319	0.00	2026-04-02 09:13:55.353
SAMPANN	Sampann Utpadan India Limited	NSE	Equities	\N	27.80	26.49	28.49	25.41	20355	0.00	2026-04-02 09:13:55.356
SANATHAN	Sanathan Textiles Limited	NSE	Textile	\N	405.10	392.85	408.45	382.05	20225	0.00	2026-04-02 09:13:55.36
SANDESH	The Sandesh Limited	NSE	Equities	\N	893.00	869.00	899.00	859.95	465	0.00	2026-04-02 09:13:55.363
SANDUMA	Sandur Manganese & Iron Ores Limited	NSE	Equities	\N	180.40	181.74	182.64	174.86	813411	0.00	2026-04-02 09:13:55.368
SANGAMIND	Sangam (India) Limited	NSE	Equities	\N	426.00	427.50	430.25	413.00	5589	0.00	2026-04-02 09:13:55.372
SANGHIIND	Sanghi Industries Limited	NSE	Equities	\N	49.82	50.17	50.26	48.52	588596	0.00	2026-04-02 09:13:55.375
SANGHVIMOV	Sanghvi Movers Limited	NSE	Equities	\N	285.40	267.40	291.76	255.41	577888	0.00	2026-04-02 09:13:55.393
SANOFI	Sanofi India Limited	NSE	Equities	\N	3250.00	3262.40	3275.40	3175.00	22927	0.00	2026-04-02 09:13:55.397
SANOFICONR	Sanofi Consumer Healthcare India Limited	NSE	Healthcare	\N	4560.60	4535.70	4590.00	4370.00	8319	0.00	2026-04-02 09:13:58.226
SANSERA	Sansera Engineering Limited	NSE	Equities	\N	2108.70	2142.40	2159.10	2052.20	128679	0.00	2026-04-02 09:13:58.229
SARDAEN	Sarda Energy & Minerals Limited	NSE	Metals & Mining	\N	514.25	525.50	519.25	502.00	297778	0.00	2026-04-02 09:13:58.239
SAPPHIRE	Sapphire Foods India Limited	NSE	Equities	\N	151.51	155.34	153.36	139.91	2502444	0.00	2026-04-02 09:13:58.236
SAREGAMA	Saregama India Limited	NSE	Equities	\N	318.80	327.60	325.35	317.50	224775	0.00	2026-04-02 09:13:58.241
SARLAPOLY	Sarla Performance Fibers Limited	NSE	Equities	\N	77.15	75.51	77.20	74.12	47002	0.00	2026-04-02 09:13:58.245
SARVESHWAR	Sarveshwar Foods Limited	NSE	Equities	\N	3.47	3.01	3.56	2.85	10103654	0.00	2026-04-02 09:13:58.248
SASTASUNDR	Sastasundar Ventures Limited	NSE	Equities	\N	272.50	270.00	273.50	264.90	10597	0.00	2026-04-02 09:13:58.253
SATIA	Satia Industries Limited	NSE	Equities	\N	56.57	55.71	57.35	54.17	77558	0.00	2026-04-02 09:13:58.256
SAURASHCEM	Saurashtra Cement Limited	NSE	Equities	\N	53.37	54.98	54.27	52.40	318759	0.00	2026-04-02 09:13:58.262
SATIN	Satin Creditcare Network Limited	NSE	Equities	\N	144.86	146.38	149.80	142.15	73363	0.00	2026-04-02 09:13:58.26
SBC	SBC Exports Limited	NSE	Equities	\N	30.75	30.24	30.84	29.90	3549256	0.00	2026-04-02 09:13:58.264
SBCL	Shivalik Bimetal Controls Limited	NSE	Equities	\N	412.90	418.00	418.35	402.00	162582	0.00	2026-04-02 09:13:58.268
SBFC	SBFC Finance Limited	NSE	Equities	\N	82.37	83.97	82.93	81.13	479267	0.00	2026-04-02 09:13:58.272
SBICARD	SBI Cards and Payment Services Limited	NSE	Equities	\N	632.35	637.15	636.85	615.50	600782	0.00	2026-04-02 09:13:58.277
SBILIFE	SBI Life Insurance Company Limited	NSE	Financial Services	\N	1767.30	1790.50	1778.90	1728.10	1200139	0.00	2026-04-02 09:13:58.282
SCHAND	S Chand And Company Limited	NSE	Equities	\N	135.72	139.98	138.59	133.95	95251	0.00	2026-04-02 09:13:58.289
SCHAEFFLER	Schaeffler India Limited	NSE	Equities	\N	3783.20	3870.60	3851.20	3707.00	47138	0.00	2026-04-02 09:13:58.287
SCI	Shipping Corporation Of India Limited	NSE	Equities	\N	225.94	231.39	228.20	220.32	2313611	0.00	2026-04-02 09:13:58.293
SCODATUBES	Scoda Tubes Limited	NSE	Equities	\N	138.10	137.83	139.00	130.99	106477	0.00	2026-04-02 09:13:58.299
SDBL	Som Distilleries & Breweries Limited	NSE	Equities	\N	68.39	69.14	69.38	65.69	576830	0.00	2026-04-02 09:13:58.302
SEAMECLTD	Seamec Limited	NSE	Equities	\N	1491.70	1442.70	1499.00	1411.30	73778	0.00	2026-04-02 09:13:58.305
SECMARK	SecMark Consultancy Limited	NSE	Equities	\N	108.29	105.43	109.69	103.10	2020	0.00	2026-04-02 09:13:58.308
SECURKLOUD	SECUREKLOUD TECHNOLOGIES LIMITED	NSE	Information Technology	\N	19.47	19.22	20.74	18.52	19194	0.00	2026-04-02 09:13:58.31
SEDEMAC	SEDEMAC Mechatronics Limited	NSE	Equities	\N	1533.30	1545.20	1557.00	1526.90	42271	0.00	2026-04-02 09:13:58.313
SEJALLTD	Sejal Glass Limited	NSE	Equities	\N	421.10	401.05	421.10	381.00	27618	0.00	2026-04-02 09:13:58.316
SEMAC	Semac Construction Limited	NSE	Equities	\N	227.00	229.89	229.89	225.31	77	0.00	2026-04-02 09:13:58.322
SENORES	Senores Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	775.70	773.55	784.95	741.90	191936	0.00	2026-04-02 09:13:58.328
SENCO	Senco Gold Limited	NSE	Equities	\N	284.80	288.60	289.85	279.45	183268	0.00	2026-04-02 09:13:58.325
SEPC	SEPC Limited	NSE	Equities	\N	5.56	5.34	5.68	5.12	36244648	0.00	2026-04-02 09:13:58.33
SERVOTECH	Servotech Renewable Power System Limited	NSE	Information Technology	\N	68.50	68.45	69.39	65.01	601642	0.00	2026-04-02 09:13:58.332
SESHAPAPER	Seshasayee Paper and Boards Limited	NSE	Equities	\N	255.49	254.36	264.85	246.75	11801	0.00	2026-04-02 09:13:58.335
SFL	Sheela Foam Limited	NSE	Equities	\N	495.60	485.85	500.25	466.40	59731	0.00	2026-04-02 09:13:58.344
SETCO	Setco Automotive Limited	NSE	Equities	\N	21.50	20.88	21.92	19.85	730735	0.00	2026-04-02 09:13:58.338
SGFIN	SG Finserve Limited	NSE	Equities	\N	450.35	450.00	460.00	427.35	275742	0.00	2026-04-02 09:13:58.347
SGIL	Synergy Green Industries Limited	NSE	Equities	\N	490.00	480.10	490.30	476.65	6757	0.00	2026-04-02 09:13:58.351
SGL	STL Global Limited	NSE	Equities	\N	9.51	9.31	9.80	9.02	5489	0.00	2026-04-02 09:13:58.354
SGMART	SG Mart Limited	NSE	Equities	\N	504.00	499.40	514.00	475.50	350001	0.00	2026-04-02 09:13:58.356
SHADOWFAX	Shadowfax Technologies Limited	NSE	Information Technology	\N	116.64	117.60	117.29	113.69	300956	0.00	2026-04-02 09:13:58.359
SHAH	Shah Metacorp Limited	NSE	Equities	\N	4.82	4.78	4.87	4.72	3318363	0.00	2026-04-02 09:13:58.361
AUTOIND	Autoline Industries Limited	NSE	Equities	\N	54.80	54.01	55.58	52.19	121224	0.00	2026-04-02 09:14:37.496
SHANKARA	Shankara Building Products Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.615581
SHRENIK	Shrenik Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SICALLOG	Sical Logistics Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SIGMAADV	SIGMA ADVANCED SYSTEMS LIMITED	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SIMBHALS	Simbhaoli Sugars Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SITINET	Siti Networks Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SMARTLINK	Smartlink Holdings Limited	NSE	Equities	\N	116.00	111.57	118.99	112.13	2473	0.00	2026-04-02 09:14:04.27
SHALBY	Shalby Limited	NSE	Equities	\N	137.70	139.57	139.54	134.21	76053	0.00	2026-04-02 09:14:01.238
SHALPAINTS	Shalimar Paints Limited	NSE	Chemicals	\N	41.51	40.86	41.69	38.21	35386	0.00	2026-04-02 09:14:01.241
SHANTI	Shanti Overseas (India) Limited	NSE	Equities	\N	6.48	5.64	6.71	5.51	106762	0.00	2026-04-02 09:14:01.245
SHANTIGOLD	Shanti Gold International Limited	NSE	Equities	\N	169.61	164.62	172.04	159.18	243084	0.00	2026-04-02 09:14:01.253
SHARDACROP	Sharda Cropchem Limited	NSE	Equities	\N	878.00	889.60	889.75	837.00	242815	0.00	2026-04-02 09:14:01.256
SHARDAMOTR	Sharda Motor Industries Limited	NSE	Automobile	\N	737.10	742.05	742.00	705.90	35000	0.00	2026-04-02 09:14:01.26
SHAREINDIA	Share India Securities Limited	NSE	Equities	\N	128.46	128.45	130.68	123.06	942326	0.00	2026-04-02 09:14:01.263
SHEKHAWATI	Shekhawati Industries Limited	NSE	Equities	\N	9.99	9.99	10.49	9.38	17317	0.00	2026-04-02 09:14:01.266
SHILCTECH	Shilchar Technologies Limited	NSE	Information Technology	\N	3927.10	3917.90	3958.80	3752.70	22442	0.00	2026-04-02 09:14:01.272
SHILPAMED	Shilpa Medicare Limited	NSE	Healthcare	\N	378.70	374.70	383.80	364.15	467068	0.00	2026-04-02 09:14:01.275
SHIVALIK	Shivalik Rasayan Limited	NSE	Equities	\N	237.27	233.50	243.46	224.01	68743	0.00	2026-04-02 09:14:01.278
SHIVAMAUTO	Shivam Autotech Limited	NSE	Information Technology	\N	16.49	15.45	16.69	14.68	74833	0.00	2026-04-02 09:14:01.281
SHIVAMILLS	Shiva Mills Limited	NSE	Equities	\N	45.47	46.91	46.00	44.27	886	0.00	2026-04-02 09:14:01.284
SHIVATEX	Shiva Texyarn Limited	NSE	Textile	\N	139.70	138.00	143.40	132.36	1291	0.00	2026-04-02 09:14:01.287
SHK	S H Kelkar and Company Limited	NSE	Equities	\N	119.10	123.30	122.00	116.50	517897	0.00	2026-04-02 09:14:01.293
SHOPERSTOP	Shoppers Stop Limited	NSE	Equities	\N	296.55	298.35	298.00	288.70	21842	0.00	2026-04-02 09:14:01.296
SHRADHA	Shradha Realty Limited	NSE	Real Estate	\N	30.69	30.84	30.90	29.10	7848	0.00	2026-04-02 09:14:01.299
SHREDIGCEM	Shree Digvijay Cement Co.Ltd	NSE	Cement	\N	66.26	63.98	66.94	60.87	180856	0.00	2026-04-02 09:14:01.302
SHREECEM	SHREE CEMENT LIMITED	NSE	Equities	\N	22980.00	23265.00	23235.00	22675.00	14716	0.00	2026-04-02 09:14:01.305
SHREEJISPG	Shreeji Shipping Global Limited	NSE	Equities	\N	331.00	337.15	336.95	320.40	269195	0.00	2026-04-02 09:14:01.309
SHREERAMA	Shree Rama Multi-Tech Limited	NSE	Information Technology	\N	46.21	47.55	47.49	44.50	202902	0.00	2026-04-02 09:14:01.315
SHREYANIND	Shreyans Industries Limited	NSE	Equities	\N	139.00	138.36	139.99	133.00	3657	0.00	2026-04-02 09:14:01.318
SHRINGARMS	Shringar House of Mangalsutra Limited	NSE	Equities	\N	174.22	177.52	177.38	169.01	401755	0.00	2026-04-02 09:14:01.32
SHRIPISTON	Shriram Pistons & Rings Limited	NSE	Equities	\N	2920.40	3025.20	3023.90	2915.00	60484	0.00	2026-04-02 09:14:01.324
SHRIRAMFIN	Shriram Finance Limited	NSE	Equities	\N	886.85	900.55	895.00	863.45	6047792	0.00	2026-04-02 09:14:01.328
SHRIRAMPPS	Shriram Properties Limited	NSE	Equities	\N	66.83	66.18	67.66	63.41	223438	0.00	2026-04-02 09:14:01.33
SHYAMMETL	Shyam Metalics and Energy Limited	NSE	Equities	\N	786.30	797.00	790.50	766.60	53761	0.00	2026-04-02 09:14:01.336
SHYAMTEL	Shyam Telecom Limited	NSE	Telecom	\N	8.60	8.18	8.90	8.15	10229	0.00	2026-04-02 09:14:01.338
SIEMENS	Siemens Limited	NSE	Equities	\N	2990.80	3017.00	3016.00	2906.00	180649	0.00	2026-04-02 09:14:01.341
SIGACHI	Sigachi Industries Limited	NSE	Equities	\N	19.28	19.47	19.66	18.50	2373654	0.00	2026-04-02 09:14:01.344
SIGIND	Signet Industries Limited	NSE	Equities	\N	47.29	46.82	47.30	44.69	6916	0.00	2026-04-02 09:14:01.347
SIGMA	Sigma Solve Limited	NSE	Equities	\N	39.07	38.15	39.29	36.19	96754	0.00	2026-04-02 09:14:01.35
SIGNATURE	Signatureglobal (India) Limited	NSE	Equities	\N	742.15	723.65	757.45	705.20	867818	0.00	2026-04-02 09:14:01.354
SIKKO	Sikko Industries Limited	NSE	Equities	\N	4.34	4.37	4.44	4.21	220571	0.00	2026-04-02 09:14:01.36
SIL	Standard Industries Limited	NSE	Equities	\N	13.19	12.26	14.00	12.18	16832	0.00	2026-04-02 09:14:01.362
SILGO	Silgo Retail Limited	NSE	Equities	\N	74.72	74.84	75.09	71.89	227444	0.00	2026-04-02 09:14:01.367
SILINV	SIL Investments Limited	NSE	Equities	\N	405.80	396.00	405.80	386.40	1476	0.00	2026-04-02 09:14:01.37
SILLYMONKS	Silly Monks Entertainment Limited	NSE	Equities	\N	15.83	15.73	16.35	15.26	1076	0.00	2026-04-02 09:14:01.374
SINCLAIR	Sinclairs Hotels Limited	NSE	Equities	\N	75.65	75.15	75.90	73.14	22874	0.00	2026-04-02 09:14:01.383
SIMPLEXINF	Simplex Infrastructures Limited	NSE	Equities	\N	155.00	158.97	157.99	148.73	182309	0.00	2026-04-02 09:14:01.381
SINDHUTRAD	Sindhu Trade Links Limited	NSE	Equities	\N	21.70	22.39	22.04	21.51	486988	0.00	2026-04-02 09:14:01.385
SINGERIND	Singer India Limited	NSE	Equities	\N	67.00	66.86	67.03	64.17	37042	0.00	2026-04-02 09:14:01.387
SINTERCOM	Sintercom India Limited	NSE	Equities	\N	72.36	69.67	73.00	69.67	965	0.00	2026-04-02 09:14:01.39
SIRCA	Sirca Paints India Limited	NSE	Chemicals	\N	420.60	422.75	426.00	410.20	120972	0.00	2026-04-02 09:14:04.239
SIS	SIS LIMITED	NSE	Equities	\N	286.00	287.40	289.10	280.05	29096	0.00	2026-04-02 09:14:04.243
SIYSIL	Siyaram Silk Mills Limited	NSE	Equities	\N	471.90	473.90	476.45	454.00	48793	0.00	2026-04-02 09:14:04.247
SJS	S.J.S. Enterprises Limited	NSE	Equities	\N	1595.60	1587.00	1605.90	1544.50	47659	0.00	2026-04-02 09:14:04.25
SJVN	SJVN Limited	NSE	Equities	\N	67.06	67.26	67.62	64.81	3381848	0.00	2026-04-02 09:14:04.252
SKFINDUS	SKF India (Industrial) Limited	NSE	Equities	\N	2218.90	2199.70	2263.60	2114.40	7899	0.00	2026-04-02 09:14:04.259
SKIPPER	Skipper Limited	NSE	Equities	\N	349.00	352.90	351.00	337.00	246789	0.00	2026-04-02 09:14:04.262
SKMEGGPROD	SKM Egg Products Export (India) Limited	NSE	Equities	\N	157.79	157.96	158.47	151.79	68350	0.00	2026-04-02 09:14:04.264
SKYGOLD	SKY GOLD AND DIAMONDS LIMITED	NSE	Equities	\N	335.90	337.75	339.80	324.00	366586	0.00	2026-04-02 09:14:04.267
SOMATEX	Soma Textiles & Industries Limited	NSE	Textile	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SUBROS	Subros Limited	NSE	Equities	\N	680.15	682.30	684.45	654.00	35836	0.00	2026-04-02 09:14:07.31
SUDARCOLOR	Sudarshan Colorants India Limited	NSE	Equities	\N	305.05	294.50	309.45	285.25	10732	0.00	2026-04-02 09:14:07.313
SUDARSCHEM	Sudarshan Chemical Industries Limited	NSE	Chemicals	\N	757.25	778.35	775.00	742.55	59362	0.00	2026-04-02 09:14:07.316
SUDEEPPHRM	Sudeep Pharma Limited	NSE	Pharmaceuticals	\N	612.10	614.00	613.95	598.50	16072	0.00	2026-04-02 09:14:07.327
SMLMAH	SML Mahindra Limited	NSE	Equities	\N	4090.00	3969.70	4155.00	3805.00	67131	0.00	2026-04-02 09:14:04.278
SMLT	Sarthak Metals Limited	NSE	Equities	\N	63.68	62.41	63.82	59.31	6680	0.00	2026-04-02 09:14:04.282
SMSPHARMA	SMS Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	384.75	392.75	390.00	370.25	340955	0.00	2026-04-02 09:14:04.286
SNOWMAN	Snowman Logistics Limited	NSE	Equities	\N	34.84	34.25	35.20	33.00	183272	0.00	2026-04-02 09:14:04.289
SOBHA	Sobha Limited	NSE	Equities	\N	1167.00	1197.90	1190.00	1130.00	259550	0.00	2026-04-02 09:14:04.292
SOFTTECH	Softtech Engineers Limited	NSE	Information Technology	\N	241.15	229.34	250.00	220.00	3952	0.00	2026-04-02 09:14:04.294
SOLARINDS	Solar Industries India Limited	NSE	Equities	\N	12993.00	12807.00	13100.00	12340.00	156856	0.00	2026-04-02 09:14:04.301
SOLARWORLD	Solarworld Energy Solutions Limited	NSE	Equities	\N	168.12	165.88	177.60	158.88	1232887	0.00	2026-04-02 09:14:04.304
SOLEX	Solex Energy Limited	NSE	Equities	\N	1010.20	1009.45	1029.00	975.00	23304	0.00	2026-04-02 09:14:04.307
SOMANYCERA	Somany Ceramics Limited	NSE	Equities	\N	383.95	363.90	388.90	355.05	29070	0.00	2026-04-02 09:14:04.31
SOMICONVEY	Somi Conveyor Beltings Limited	NSE	Equities	\N	98.41	95.49	98.69	93.89	4885	0.00	2026-04-02 09:14:04.314
SONACOMS	Sona BLW Precision Forgings Limited	NSE	Equities	\N	495.00	497.25	497.15	478.30	1631337	0.00	2026-04-02 09:14:04.413
SONAMLTD	SONAM LIMITED	NSE	Equities	\N	53.60	53.91	53.94	52.80	17635	0.00	2026-04-02 09:14:04.422
SOTL	Savita Oil Technologies Limited	NSE	Information Technology	\N	312.60	312.55	316.00	302.50	38204	0.00	2026-04-02 09:14:04.43
SOUTHBANK	The South Indian Bank Limited	NSE	Banking	\N	36.47	36.36	36.92	35.21	14602181	0.00	2026-04-02 09:14:04.434
SOUTHWEST	South West Pinnacle Exploration Limited	NSE	Equities	\N	217.91	217.01	221.09	210.31	68853	0.00	2026-04-02 09:14:04.436
SPAL	S. P. Apparels Limited	NSE	Textile	\N	715.10	725.00	729.00	701.00	9770	0.00	2026-04-02 09:14:04.44
SPANDANA	Spandana Sphoorty Financial Limited	NSE	Equities	\N	196.77	192.58	199.13	187.50	122221	0.00	2026-04-02 09:14:04.443
SPCENET	Spacenet Enterprises India Limited	NSE	Equities	\N	3.15	3.14	3.16	3.10	435505	0.00	2026-04-02 09:14:04.449
SPECIALITY	Speciality Restaurants Limited	NSE	Equities	\N	97.50	90.05	97.62	87.55	64540	0.00	2026-04-02 09:14:04.454
SPENCERS	Spencer's Retail Limited	NSE	Equities	\N	29.95	27.98	29.95	27.36	142582	0.00	2026-04-02 09:14:04.461
SPIC	Southern Petrochemicals Industries Corporation  Limited	NSE	Chemicals	\N	61.40	61.03	61.86	58.65	411129	0.00	2026-04-02 09:14:04.464
SPLIL	SPL Industries Limited	NSE	Equities	\N	25.09	23.05	26.00	22.49	7545	0.00	2026-04-02 09:14:04.467
SPLPETRO	Supreme Petrochem Limited	NSE	Chemicals	\N	725.00	738.85	733.40	715.65	34302	0.00	2026-04-02 09:14:04.469
SPMLINFRA	SPML Infra Limited	NSE	Equities	\N	168.69	169.40	171.20	161.15	355081	0.00	2026-04-02 09:14:04.472
SPORTKING	Sportking India Limited	NSE	Equities	\N	124.40	121.25	126.42	119.50	569114	0.00	2026-04-02 09:14:04.475
SREEL	Sreeleathers Limited	NSE	Equities	\N	176.20	174.44	178.68	167.92	3332	0.00	2026-04-02 09:14:04.48
SRF	SRF Limited	NSE	Equities	\N	2407.60	2555.20	2485.00	2395.30	498304	0.00	2026-04-02 09:14:04.485
SRGHFL	SRG Housing Finance Limited	NSE	Equities	\N	244.25	247.96	244.25	244.00	301	0.00	2026-04-02 09:14:04.488
SRHHYPOLTD	Sree Rayalaseema Hi-Strength Hypo Limited	NSE	Equities	\N	416.55	411.95	422.50	402.00	6734	0.00	2026-04-02 09:14:04.491
SRM	SRM Contractors Limited	NSE	Equities	\N	410.25	404.85	414.20	393.00	116896	0.00	2026-04-02 09:14:04.495
SRTL	Shree Ram Twistex Limited	NSE	Equities	\N	43.49	42.09	44.73	41.37	230516	0.00	2026-04-02 09:14:04.498
SSDL	Saraswati Saree Depot Limited	NSE	Equities	\N	55.70	54.83	56.49	52.86	27827	0.00	2026-04-02 09:14:07.232
STALLION	Stallion India Fluorochemicals Limited	NSE	Chemicals	\N	111.36	106.98	112.32	102.65	1135940	0.00	2026-04-02 09:14:07.238
STANLEY	Stanley Lifestyles Limited	NSE	Equities	\N	125.61	130.08	128.85	124.20	241427	0.00	2026-04-02 09:14:07.241
STAR	Strides Pharma Science Limited	NSE	Pharmaceuticals	\N	965.60	963.60	974.80	925.00	174937	0.00	2026-04-02 09:14:07.244
STARCEMENT	Star Cement Limited	NSE	Equities	\N	205.38	205.82	207.84	200.48	98173	0.00	2026-04-02 09:14:07.248
STARHEALTH	Star Health and Allied Insurance Company Limited	NSE	Financial Services	\N	470.30	469.90	471.60	453.70	280774	0.00	2026-04-02 09:14:07.25
STARPAPER	Star Paper Mills Limited	NSE	Equities	\N	127.47	128.13	128.00	125.30	4907	0.00	2026-04-02 09:14:07.254
STCINDIA	The State Trading Corporation of India Limited	NSE	Equities	\N	103.84	103.17	104.50	101.01	25917	0.00	2026-04-02 09:14:07.259
STEELCAS	Steelcast Limited	NSE	Metals & Mining	\N	240.59	236.28	241.60	230.00	29637	0.00	2026-04-02 09:14:07.262
STEELCITY	Steel City Securities Limited	NSE	Metals & Mining	\N	77.59	74.80	77.59	73.99	6366	0.00	2026-04-02 09:14:07.267
STEELXIND	STEEL EXCHANGE INDIA LIMITED	NSE	Metals & Mining	\N	7.55	7.63	7.67	7.25	1040833	0.00	2026-04-02 09:14:07.27
STEL	Stel Holdings Limited	NSE	Equities	\N	438.00	432.80	442.85	432.05	1580	0.00	2026-04-02 09:14:07.277
STERTOOLS	Sterling Tools Limited	NSE	Equities	\N	203.00	181.06	209.90	175.00	1106875	0.00	2026-04-02 09:14:07.281
STLTECH	Sterlite Technologies Limited	NSE	Information Technology	\N	176.01	181.48	181.39	170.80	3644204	0.00	2026-04-02 09:14:07.288
STOVEKRAFT	Stove Kraft Limited	NSE	Equities	\N	473.45	477.40	480.25	460.00	112159	0.00	2026-04-02 09:14:07.291
STUDDS	Studds Accessories Limited	NSE	Equities	\N	448.80	452.05	459.95	444.15	13678	0.00	2026-04-02 09:14:07.294
STYL	Seshaasai Technologies Limited	NSE	Information Technology	\N	227.81	224.70	231.20	218.00	48139	0.00	2026-04-02 09:14:07.296
STYLAMIND	Stylam Industries Limited	NSE	Equities	\N	2167.60	2175.10	2182.60	2155.50	44616	0.00	2026-04-02 09:14:07.299
STYLEBAAZA	Baazar Style Retail Limited	NSE	Equities	\N	291.50	294.45	294.90	284.05	316375	0.00	2026-04-02 09:14:07.302
SUBEXLTD	Subex Limited	NSE	Equities	\N	7.73	7.46	7.89	7.24	1988282	0.00	2026-04-02 09:14:07.307
SUPREMEENG	Supreme Engineering Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SUPREMEINF	Supreme Infrastructure India Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
SWANDEF	Swan Defence and Heavy Industries Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
TAKE	Take Solutions Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
TARMAT	Tarmat Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.634869
TATAINVEST	Tata Investment Corporation Limited	NSE	Equities	\N	577.70	577.10	583.50	556.15	303137	0.00	2026-04-02 09:14:10.378
TATAPOWER	Tata Power Company Limited	NSE	Equities	\N	379.30	380.20	381.45	368.00	6316192	0.00	2026-04-02 09:14:10.38
SUKHJITS	Sukhjit Starch & Chemicals Limited	NSE	Chemicals	\N	159.00	158.25	162.00	152.83	10429	0.00	2026-04-02 09:14:07.33
SULA	Sula Vineyards Limited	NSE	Equities	\N	154.85	155.39	156.83	149.10	342994	0.00	2026-04-02 09:14:07.333
SUMICHEM	Sumitomo Chemical India Limited	NSE	Chemicals	\N	380.45	380.20	385.50	368.85	105768	0.00	2026-04-02 09:14:07.338
SUMIT	Sumit Woods Limited	NSE	Equities	\N	46.04	46.39	47.09	45.01	16502	0.00	2026-04-02 09:14:07.341
SUMMITSEC	Summit Securities Limited	NSE	Equities	\N	1496.80	1461.60	1510.00	1412.00	5295	0.00	2026-04-02 09:14:07.344
SUNCLAY	Sundaram Clayton Limited	NSE	Equities	\N	1255.70	1240.30	1262.90	1207.90	14195	0.00	2026-04-02 09:14:07.346
SUNDARAM	Sundaram Multi Pap Limited	NSE	Equities	\N	1.21	1.22	1.22	1.17	275950	0.00	2026-04-02 09:14:07.349
SUNDARMFIN	Sundaram Finance Limited	NSE	Equities	\N	4531.00	4593.40	4553.90	4387.10	42775	0.00	2026-04-02 09:14:07.351
SUNDRMFAST	Sundram Fasteners Limited	NSE	Equities	\N	746.55	752.90	755.10	730.10	65439	0.00	2026-04-02 09:14:07.356
SUNDROP	Sundrop Brands Limited	NSE	Equities	\N	588.30	586.55	592.80	575.05	6053	0.00	2026-04-02 09:14:07.36
SUNFLAG	Sunflag Iron And Steel Company Limited	NSE	Metals & Mining	\N	208.49	213.13	211.00	204.83	259502	0.00	2026-04-02 09:14:07.362
SUNTECK	Sunteck Realty Limited	NSE	Real Estate	\N	300.95	295.10	304.40	283.00	102115	0.00	2026-04-02 09:14:07.367
SUNTV	Sun TV Network Limited	NSE	Equities	\N	597.55	582.40	604.45	565.20	232549	0.00	2026-04-02 09:14:07.371
SUPERHOUSE	Superhouse Limited	NSE	Equities	\N	139.00	138.60	139.00	133.02	822	0.00	2026-04-02 09:14:07.373
SUPRAJIT	Suprajit Engineering Limited	NSE	Equities	\N	411.00	421.95	414.35	403.00	36284	0.00	2026-04-02 09:14:07.379
SUPREME	Supreme Holdings & Hospitality (India) Limited	NSE	Healthcare	\N	51.00	53.79	52.80	49.00	58811	0.00	2026-04-02 09:14:07.382
SUPREMEIND	Supreme Industries Limited	NSE	Equities	\N	3614.80	3658.40	3661.00	3413.00	437297	0.00	2026-04-02 09:14:07.385
SUPRIYA	Supriya Lifescience Limited	NSE	Equities	\N	604.65	601.00	611.90	583.95	67060	0.00	2026-04-02 09:14:07.388
SURAJEST	Suraj Estate Developers Limited	NSE	Equities	\N	189.83	186.71	191.73	180.35	42296	0.00	2026-04-02 09:14:10.231
SURAJLTD	Suraj Limited	NSE	Equities	\N	250.00	258.39	266.49	240.61	8317	0.00	2026-04-02 09:14:10.235
SURANASOL	Surana Solar Limited	NSE	Equities	\N	22.65	22.03	22.90	20.50	88978	0.00	2026-04-02 09:14:10.242
SURANAT&P	Surana Telecom and Power Limited	NSE	Telecom	\N	17.04	16.83	17.60	16.80	36165	0.00	2026-04-02 09:14:10.246
SURYALAXMI	Suryalakshmi Cotton Mills Limited	NSE	Textile	\N	50.20	49.87	52.99	48.02	13833	0.00	2026-04-02 09:14:10.249
SURYAROSNI	Surya Roshni Limited	NSE	Equities	\N	215.83	208.12	217.00	200.11	270336	0.00	2026-04-02 09:14:10.254
SURYODAY	Suryoday Small Finance Bank Limited	NSE	Banking	\N	124.90	125.11	126.63	121.11	72049	0.00	2026-04-02 09:14:10.258
SUVEN	Suven Life Sciences Limited	NSE	Equities	\N	153.61	147.43	159.78	140.30	873042	0.00	2026-04-02 09:14:10.265
SUVIDHAA	Suvidhaa Infoserve Limited	NSE	Equities	\N	2.45	2.44	2.49	2.31	66773	0.00	2026-04-02 09:14:10.27
SUYOG	Suyog Telematics Limited	NSE	Equities	\N	663.05	636.45	670.00	635.35	19735	0.00	2026-04-02 09:14:10.275
SUZLON	Suzlon Energy Limited	NSE	Equities	\N	40.39	41.12	40.74	39.77	50660982	0.00	2026-04-02 09:14:10.278
SVLL	Shree Vasu Logistics Limited	NSE	Equities	\N	519.00	505.35	524.95	467.15	75	0.00	2026-04-02 09:14:10.282
SVPGLOB	SVP GLOBAL TEXTILES LIMITED	NSE	Textile	\N	2.45	2.35	2.58	2.25	14758	0.00	2026-04-02 09:14:10.286
SWANCORP	SWAN CORP LIMITED	NSE	Equities	\N	309.05	321.90	313.45	300.95	901555	0.00	2026-04-02 09:14:10.29
SWELECTES	Swelect Energy Systems Limited	NSE	Equities	\N	532.00	532.05	541.00	515.10	10101	0.00	2026-04-02 09:14:10.299
SWIGGY	Swiggy Limited	NSE	Equities	\N	270.00	265.30	272.00	256.70	7388917	0.00	2026-04-02 09:14:10.303
SWSOLAR	Sterling and Wilson Renewable Energy Limited	NSE	Equities	\N	161.71	163.60	163.89	155.15	1579624	0.00	2026-04-02 09:14:10.307
SYMPHONY	Symphony Limited	NSE	Equities	\N	715.75	724.00	726.25	697.60	79919	0.00	2026-04-02 09:14:10.311
SYNCOMF	Syncom Formulations (India) Limited	NSE	Equities	\N	11.22	11.17	11.34	10.72	1550091	0.00	2026-04-02 09:14:10.315
SYRMA	Syrma SGS Technology Limited	NSE	Information Technology	\N	788.20	797.60	795.80	765.20	632146	0.00	2026-04-02 09:14:10.322
SYSTMTXC	Systematix Corporate Services Limited	NSE	Equities	\N	62.90	57.80	63.19	55.50	61139	0.00	2026-04-02 09:14:10.326
TAINWALCHM	Tainwala Chemical and Plastic (I) Limited	NSE	Chemicals	\N	178.00	178.55	178.49	171.00	2921	0.00	2026-04-02 09:14:10.329
TAJGVK	Taj GVK Hotels & Resorts Limited	NSE	Equities	\N	314.30	318.60	317.75	301.40	76329	0.00	2026-04-02 09:14:10.332
TALBROAUTO	Talbros Automotive Components Limited	NSE	Equities	\N	248.50	243.31	250.00	235.10	47280	0.00	2026-04-02 09:14:10.336
TANLA	Tanla Platforms Limited	NSE	Equities	\N	420.70	419.00	428.30	401.00	527945	0.00	2026-04-02 09:14:10.339
TARAPUR	Tarapur Transformers Limited	NSE	Equities	\N	24.00	24.38	24.50	23.61	10603	0.00	2026-04-02 09:14:10.346
TARC	TARC Limited	NSE	Equities	\N	119.14	119.60	120.35	115.00	254307	0.00	2026-04-02 09:14:10.349
TARIL	Transformers And Rectifiers (India) Limited	NSE	Equities	\N	268.95	274.30	272.20	263.55	2048787	0.00	2026-04-02 09:14:10.352
TARSONS	Tarsons Products Limited	NSE	Equities	\N	179.47	179.88	181.79	174.00	95515	0.00	2026-04-02 09:14:10.355
TASTYBITE	Tasty Bite Eatables Limited	NSE	Equities	\N	6690.50	6697.50	6815.00	6560.00	777	0.00	2026-04-02 09:14:10.359
TATACAP	Tata Capital Limited	NSE	Equities	\N	307.35	305.90	310.40	300.15	736557	0.00	2026-04-02 09:14:10.362
TATACHEM	Tata Chemicals Limited	NSE	Chemicals	\N	651.45	606.75	676.45	592.50	9280234	0.00	2026-04-02 09:14:10.366
TATACOMM	Tata Communications Limited	NSE	Equities	\N	1364.00	1390.20	1378.00	1322.50	149189	0.00	2026-04-02 09:14:10.369
TATAELXSI	Tata Elxsi Limited	NSE	Equities	\N	4230.00	4127.10	4252.90	4023.60	211913	0.00	2026-04-02 09:14:10.375
TIPSFILMS	Tips Films Limited	NSE	Equities	\N	292.40	292.95	294.25	288.15	1738	0.00	2026-04-02 09:14:13.363
TIJARIA	Tijaria Polypipes Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
TIRUPATIFL	Tirupati Forge Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
TOUCHWOOD	Touchwood Entertainment Limited	NSE	Equities	\N	67.80	65.89	67.82	64.00	1319	0.00	2026-04-02 09:14:16.246
TCPLPACK	TCPL Packaging Limited	NSE	Equities	\N	2312.30	2390.40	2359.80	2251.30	4880	0.00	2026-04-02 09:14:13.238
TPHQ	Teamo Productions HQ Limited	NSE	Equities	\N	0.48	0.46	0.48	0.45	658409	0.00	2026-04-02 09:14:16.25
TPLPLASTEH	TPL Plastech Limited	NSE	Information Technology	\N	58.90	57.60	60.28	54.91	116573	0.00	2026-04-02 09:14:16.253
TATASTEEL	Tata Steel Limited	NSE	Metals & Mining	\N	192.85	194.60	194.46	187.95	22128516	0.00	2026-04-02 09:14:10.384
TATVA	Tatva Chintan Pharma Chem Limited	NSE	Pharmaceuticals	\N	1098.60	1103.80	1115.00	1055.20	30924	0.00	2026-04-02 09:14:10.389
TBOTEK	TBO Tek Limited	NSE	Equities	\N	1083.00	1093.90	1095.90	1057.40	32455	0.00	2026-04-02 09:14:10.392
TCC	TCC Concept Limited	NSE	Equities	\N	342.15	346.20	350.00	335.05	4751	0.00	2026-04-02 09:14:10.398
TCI	Transport Corporation of India Limited	NSE	Equities	\N	984.90	929.05	1015.00	905.00	795293	0.00	2026-04-02 09:14:10.401
TCIEXP	TCI Express Limited	NSE	Equities	\N	491.95	474.05	509.00	464.05	37027	0.00	2026-04-02 09:14:10.403
TCIFINANCE	TCI Finance Limited	NSE	Equities	\N	13.02	13.39	13.60	12.51	39526	0.00	2026-04-02 09:14:13.229
TDPOWERSYS	TD Power Systems Limited	NSE	Equities	\N	868.30	862.60	878.00	826.00	504814	0.00	2026-04-02 09:14:13.247
TEAMLEASE	Teamlease Services Limited	NSE	Equities	\N	1170.00	1150.20	1174.90	1111.60	11772	0.00	2026-04-02 09:14:13.253
TECHM	Tech Mahindra Limited	NSE	Information Technology	\N	1440.60	1404.50	1447.00	1383.50	1589393	0.00	2026-04-02 09:14:13.259
TECHNOE	Techno Electric & Engineering Company Limited	NSE	Information Technology	\N	1037.50	1031.35	1056.75	993.85	145459	0.00	2026-04-02 09:14:13.262
TECILCHEM	TECIL Chemicals and Hydro Power Limited	NSE	Chemicals	\N	11.98	11.23	11.98	10.70	1576	0.00	2026-04-02 09:14:13.265
TEGA	Tega Industries Limited	NSE	Equities	\N	1706.00	1693.00	1714.90	1655.00	27854	0.00	2026-04-02 09:14:13.269
TEJASNET	Tejas Networks Limited	NSE	Equities	\N	414.00	420.05	419.10	402.00	3648018	0.00	2026-04-02 09:14:13.271
TEMBO	Tembo Global Industries Limited	NSE	Equities	\N	489.00	480.00	492.70	467.90	192921	0.00	2026-04-02 09:14:13.275
TERASOFT	Tera Software Limited	NSE	Information Technology	\N	317.00	312.65	328.00	302.90	15019	0.00	2026-04-02 09:14:13.283
TEXINFRA	Texmaco Infrastructure & Holdings Limited	NSE	Equities	\N	97.31	96.58	98.00	94.66	43005	0.00	2026-04-02 09:14:13.286
TEXMOPIPES	Texmo Pipes and Products Limited	NSE	Equities	\N	38.78	37.84	39.50	36.47	54187	0.00	2026-04-02 09:14:13.288
TEXRAIL	Texmaco Rail & Engineering Limited	NSE	Equities	\N	88.77	88.40	90.12	83.73	2611224	0.00	2026-04-02 09:14:13.292
TFCILTD	Tourism Finance Corporation of India Limited	NSE	Equities	\N	64.47	65.75	65.00	63.80	4666647	0.00	2026-04-02 09:14:13.294
TFL	Transwarranty Finance Limited	NSE	Equities	\N	11.52	12.12	12.27	11.45	5103	0.00	2026-04-02 09:14:13.298
THANGAMAYL	Thangamayil Jewellery Limited	NSE	Consumer Goods	\N	3511.00	3552.40	3553.00	3409.00	41035	0.00	2026-04-02 09:14:13.305
THEINVEST	The Investment Trust Of India Limited	NSE	Equities	\N	96.32	94.25	96.32	93.75	1696	0.00	2026-04-02 09:14:13.307
THEJO	Thejo Engineering Limited	NSE	Equities	\N	1529.00	1487.30	1539.90	1443.60	2586	0.00	2026-04-02 09:14:13.311
THELEELA	Leela Palaces Hotels & Resorts Limited	NSE	Equities	\N	414.75	417.15	416.80	407.00	41410	0.00	2026-04-02 09:14:13.314
THEMISMED	Themis Medicare Limited	NSE	Healthcare	\N	78.67	74.18	79.90	71.20	84206	0.00	2026-04-02 09:14:13.318
THERMAX	Thermax Limited	NSE	Equities	\N	3287.80	3345.40	3337.50	3208.60	130306	0.00	2026-04-02 09:14:13.32
THOMASCOOK	Thomas Cook  (India)  Limited	NSE	Equities	\N	94.70	95.78	95.78	90.62	606308	0.00	2026-04-02 09:14:13.324
THYROCARE	Thyrocare Technologies Limited	NSE	Information Technology	\N	363.60	362.00	366.85	352.90	101928	0.00	2026-04-02 09:14:13.33
TI	Tilaknagar Industries Limited	NSE	Equities	\N	423.35	425.75	426.00	413.75	477784	0.00	2026-04-02 09:14:13.334
TICL	Twamev Construction and Infrastructure Limited	NSE	Equities	\N	22.80	22.42	23.17	21.93	1551354	0.00	2026-04-02 09:14:13.338
TIGERLOGS	Tiger Logistics (India) Limited	NSE	Equities	\N	25.84	26.33	26.25	25.07	67390	0.00	2026-04-02 09:14:13.34
TIIL	Technocraft Industries (India) Limited	NSE	Information Technology	\N	2241.00	2254.30	2260.60	2182.40	43644	0.00	2026-04-02 09:14:13.344
TIINDIA	Tube Investments of India Limited	NSE	Equities	\N	2548.70	2572.70	2563.20	2472.80	207795	0.00	2026-04-02 09:14:13.348
TIL	TIL Limited	NSE	Equities	\N	174.00	176.88	179.90	169.11	81653	0.00	2026-04-02 09:14:13.35
TIMKEN	Timken India Limited	NSE	Equities	\N	3380.80	3339.60	3389.00	3221.00	25301	0.00	2026-04-02 09:14:13.356
TINNARUBR	Tinna Rubber and Infrastructure Limited	NSE	Equities	\N	609.10	597.15	622.90	575.55	23122	0.00	2026-04-02 09:14:13.36
TIPSMUSIC	Tips Music Limited	NSE	Equities	\N	526.50	514.60	530.50	504.30	161276	0.00	2026-04-02 09:14:13.365
TIRUMALCHM	Thirumalai Chemicals Limited	NSE	Chemicals	\N	172.73	180.07	177.74	171.46	285819	0.00	2026-04-02 09:14:13.368
TITAGARH	TITAGARH RAIL SYSTEMS LIMITED	NSE	Equities	\N	607.55	609.00	613.70	584.60	479278	0.00	2026-04-02 09:14:13.371
TMB	Tamilnad Mercantile Bank Limited	NSE	Banking	\N	614.10	606.60	620.50	597.65	159776	0.00	2026-04-02 09:14:13.378
TMCV	Tata Motors Limited	NSE	Automobile	\N	382.45	396.05	390.00	375.80	17346430	0.00	2026-04-02 09:14:13.381
TMPV	Tata Motors Passenger Vehicles Limited	NSE	Automobile	\N	301.50	302.95	303.65	295.05	6936576	0.00	2026-04-02 09:14:13.384
TNPETRO	Tamilnadu PetroProducts Limited	NSE	Equities	\N	83.20	83.56	84.70	81.20	120242	0.00	2026-04-02 09:14:13.387
TNPL	Tamil Nadu Newsprint & Papers Limited	NSE	Equities	\N	130.49	128.53	131.00	126.00	32385	0.00	2026-04-02 09:14:13.389
TNTELE	Tamilnadu Telecommunication Limited	NSE	Telecom	\N	8.99	8.68	9.20	8.70	11324	0.00	2026-04-02 09:14:13.395
TOLINS	Tolins Tyres Limited	NSE	Equities	\N	93.50	93.15	94.60	89.45	57469	0.00	2026-04-02 09:14:16.231
TORNTPHARM	Torrent Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	3988.90	4111.30	4090.80	3871.10	599352	0.00	2026-04-02 09:14:16.236
TORNTPOWER	Torrent Power Limited	NSE	Equities	\N	1320.80	1337.10	1336.90	1285.00	397888	0.00	2026-04-02 09:14:16.239
TOTAL	Total Transport Systems Limited	NSE	Equities	\N	50.00	50.65	50.00	48.46	3272	0.00	2026-04-02 09:14:16.242
TREEHOUSE	Tree House Education & Accessories Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
TTL	T T Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
TVSSCS	TVS Supply Chain Solutions Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
UMESLTD	Usha Martin Education & Solutions Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
UNIVPHOTO	Universus Photo Imagings Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
USK	Udayshivakumar Infra Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
UTTAMSUGAR	Uttam Sugar Mills Limited	NSE	Equities	\N	244.35	244.53	251.37	236.31	178308	0.00	2026-04-02 09:14:19.315
V2RETAIL	V2 Retail Limited	NSE	Equities	\N	191.18	189.42	192.86	180.00	1034410	0.00	2026-04-02 09:14:19.32
TRANSRAILL	Transrail Lighting Limited	NSE	Equities	\N	482.50	483.70	487.35	463.00	293166	0.00	2026-04-02 09:14:16.261
TRANSWORLD	TRANSWORLD SHIPPING LINES LIMITED	NSE	Equities	\N	130.65	132.24	132.00	126.68	20294	0.00	2026-04-02 09:14:16.263
TREJHARA	TREJHARA SOLUTIONS LIMITED	NSE	Equities	\N	145.79	144.94	145.79	137.70	5373	0.00	2026-04-02 09:14:16.27
TREL	Transindia Real Estate Limited	NSE	Real Estate	\N	24.78	24.87	24.95	24.26	40981	0.00	2026-04-02 09:14:16.274
TRENT	Trent Limited	NSE	Consumer Goods	\N	3525.00	3526.50	3567.40	3400.20	887876	0.00	2026-04-02 09:14:16.278
TRF	TRF Limited	NSE	Equities	\N	235.45	232.06	235.49	223.03	12740	0.00	2026-04-02 09:14:16.281
TRIDENT	Trident Limited	NSE	Equities	\N	23.69	23.89	23.99	23.01	5877216	0.00	2026-04-02 09:14:16.283
TRIGYN	Trigyn Technologies Limited	NSE	Information Technology	\N	45.85	45.57	46.40	43.50	37853	0.00	2026-04-02 09:14:16.287
TRIVENI	Triveni Engineering & Industries Limited	NSE	Equities	\N	388.70	392.70	394.00	377.05	316202	0.00	2026-04-02 09:14:16.294
TRU	TruCap Finance Limited	NSE	Equities	\N	5.10	4.86	5.10	4.81	52479	0.00	2026-04-02 09:14:16.296
TRUALT	TruAlt Bioenergy Limited	NSE	Equities	\N	410.20	410.75	413.00	399.00	81309	0.00	2026-04-02 09:14:16.301
TSFINV	TSF INVESTMENTS LIMITED	NSE	Equities	\N	348.30	357.45	355.00	340.00	79073	0.00	2026-04-02 09:14:16.304
TTKHLTCARE	TTK Healthcare Limited	NSE	Healthcare	\N	786.45	783.50	792.90	756.05	1627	0.00	2026-04-02 09:14:16.308
TTKPRESTIG	TTK Prestige Limited	NSE	Equities	\N	437.45	445.20	442.55	431.45	98358	0.00	2026-04-02 09:14:16.312
TVSELECT	TVS Electronics Limited	NSE	Equities	\N	366.00	375.80	375.05	364.10	52896	0.00	2026-04-02 09:14:16.318
TVSHLTD	TVS Holdings Limited	NSE	Equities	\N	13966.00	14217.00	14200.00	13930.00	3840	0.00	2026-04-02 09:14:16.322
TVSMOTOR	TVS Motor Company Limited	NSE	Automobile	\N	3375.00	3425.80	3405.90	3293.80	713820	0.00	2026-04-02 09:14:16.326
TVSSRICHAK	TVS Srichakra Limited	NSE	Equities	\N	3500.00	3394.70	3550.00	3302.10	3784	0.00	2026-04-02 09:14:16.329
TVTODAY	TV Today Network Limited	NSE	Equities	\N	100.87	103.42	103.00	99.00	102105	0.00	2026-04-02 09:14:16.332
TVVISION	TV Vision Limited	NSE	Equities	\N	5.44	5.31	5.50	5.06	11205	0.00	2026-04-02 09:14:16.336
UBL	United Breweries Limited	NSE	Equities	\N	1484.60	1584.20	1565.00	1478.00	163131	0.00	2026-04-02 09:14:16.348
UCAL	UCAL LIMITED	NSE	Equities	\N	89.05	86.75	91.80	83.82	5071	0.00	2026-04-02 09:14:16.352
UDS	Updater Services Limited	NSE	Equities	\N	137.16	136.81	144.90	132.65	147366	0.00	2026-04-02 09:14:16.359
UEL	Ujaas Energy Limited	NSE	Equities	\N	145.40	138.48	145.40	133.02	9306	0.00	2026-04-02 09:14:16.368
UFBL	United Foodbrands Limited	NSE	Equities	\N	209.50	204.41	219.00	191.00	61267	0.00	2026-04-02 09:14:16.372
UFLEX	UFLEX Limited	NSE	Equities	\N	362.50	369.25	369.90	356.80	49377	0.00	2026-04-02 09:14:16.375
UFO	UFO Moviez India Limited	NSE	Equities	\N	62.61	61.62	63.49	60.05	74336	0.00	2026-04-02 09:14:16.38
UGROCAP	Ugro Capital Limited	NSE	Equities	\N	87.73	88.83	89.02	83.52	235717	0.00	2026-04-02 09:14:16.387
UJJIVANSFB	Ujjivan Small Finance Bank Limited	NSE	Banking	\N	54.90	53.62	55.20	51.00	15164524	0.00	2026-04-02 09:14:16.391
ULTRACEMCO	UltraTech Cement Limited	NSE	Information Technology	\N	10552.00	10714.00	10639.00	10365.00	253389	0.00	2026-04-02 09:14:16.396
UMAEXPORTS	Uma Exports Limited	NSE	Equities	\N	20.83	20.35	21.75	19.76	103205	0.00	2026-04-02 09:14:16.399
UMIYA-MRO	UMIYA BUILDCON LIMITED	NSE	Equities	\N	75.99	74.74	76.00	73.00	5936	0.00	2026-04-02 09:14:16.403
UNICHEMLAB	Unichem Laboratories Limited	NSE	Equities	\N	298.00	298.20	300.65	291.30	13264	0.00	2026-04-02 09:14:16.407
UNIECOM	Unicommerce Esolutions Limited	NSE	Equities	\N	87.46	85.61	89.48	81.81	409053	0.00	2026-04-02 09:14:16.415
UNIENTER	Uniphos Enterprises Limited	NSE	Equities	\N	96.49	94.24	96.49	90.00	1098	0.00	2026-04-02 09:14:16.418
UNIINFO	Uniinfo Telecom Services Limited	NSE	Telecom	\N	10.87	10.77	11.70	10.31	3542	0.00	2026-04-02 09:14:16.423
UNIMECH	Unimech Aerospace and Manufacturing Limited	NSE	Equities	\N	733.20	723.70	750.00	701.70	59333	0.00	2026-04-02 09:14:19.241
UNIONBANK	Union Bank of India	NSE	Banking	\N	169.64	171.64	171.17	164.20	12224030	0.00	2026-04-02 09:14:19.244
UNIPARTS	Uniparts India Limited	NSE	Equities	\N	467.85	458.80	472.75	445.05	35942	0.00	2026-04-02 09:14:19.253
UNITDSPR	United Spirits Limited	NSE	Equities	\N	1216.80	1249.30	1238.10	1211.00	656981	0.00	2026-04-02 09:14:19.257
UNITEDPOLY	United Polyfab Gujarat Limited	NSE	Equities	\N	24.50	23.90	24.74	23.64	86641	0.00	2026-04-02 09:14:19.263
UNITEDTEA	The United Nilgiri Tea Estates Company Limited	NSE	Equities	\N	508.30	511.75	518.75	505.05	2159	0.00	2026-04-02 09:14:19.269
UNIVASTU	Univastu India Limited	NSE	Equities	\N	61.40	61.80	61.77	60.70	17020	0.00	2026-04-02 09:14:19.275
UNIVCABLES	Universal Cables Limited	NSE	Equities	\N	664.00	684.50	682.00	647.15	52299	0.00	2026-04-02 09:14:19.281
UNOMINDA	UNO Minda Limited	NSE	Equities	\N	1021.60	1043.40	1033.60	1003.30	1267036	0.00	2026-04-02 09:14:19.285
UPL	UPL Limited	NSE	Equities	\N	588.60	594.50	592.40	573.95	1109391	0.00	2026-04-02 09:14:19.289
URBANCO	Urban Company Limited	NSE	Equities	\N	121.15	123.79	121.99	119.74	1988591	0.00	2026-04-02 09:14:19.294
URJA	Urja Global Limited	NSE	Equities	\N	9.11	8.98	9.24	8.70	1488434	0.00	2026-04-02 09:14:19.296
USHAMART	Usha Martin Limited	NSE	Equities	\N	401.80	406.65	406.50	390.00	239931	0.00	2026-04-02 09:14:19.3
UTIAMC	UTI Asset Management Company Limited	NSE	Financial Services	\N	938.25	950.50	946.10	926.50	67273	0.00	2026-04-02 09:14:19.303
UTKARSHBNK	Utkarsh Small Finance Bank Limited	NSE	Banking	\N	11.57	11.44	11.67	10.86	5318819	0.00	2026-04-02 09:14:19.309
UTLSOLAR	Fujiyama Power Systems Limited	NSE	Equities	\N	201.75	203.21	203.50	199.06	80692	0.00	2026-04-02 09:14:19.312
VARDMNPOLY	Vardhman Polytex Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
VHLTD	Viceroy Hotels Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
VIJIFIN	Viji Finance Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
VIPULLTD	Vipul Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.652796
WAAREEINDO	Indosolar Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.668866
VSTL	Vibhor Steel Tubes Limited	NSE	Metals & Mining	\N	107.01	108.76	109.08	103.91	5607	0.00	2026-04-02 09:14:22.33
VSTTILLERS	V.S.T Tillers Tractors Limited	NSE	Equities	\N	4949.40	4936.70	4984.00	4749.10	8997	0.00	2026-04-02 09:14:22.332
VTL	Vardhman Textiles Limited	NSE	Textile	\N	533.20	529.80	542.90	520.50	583643	0.00	2026-04-02 09:14:22.336
WAAREEENER	Waaree Energies Limited	NSE	Equities	\N	3052.90	3089.20	3075.00	2980.80	1019264	0.00	2026-04-02 09:14:22.339
VAIBHAVGBL	Vaibhav Global Limited	NSE	Equities	\N	184.82	185.33	186.87	177.58	222448	0.00	2026-04-02 09:14:19.326
VAKRANGEE	Vakrangee Limited	NSE	Equities	\N	5.89	5.42	6.00	5.01	5161021	0.00	2026-04-02 09:14:19.332
VALIANTORG	Valiant Organics Limited	NSE	Equities	\N	231.01	230.75	238.00	218.66	29263	0.00	2026-04-02 09:14:19.338
VENKEYS	Venky's (India) Limited	NSE	Equities	\N	1215.00	1220.70	1233.00	1182.10	21303	0.00	2026-04-02 09:14:19.441
VARDHACRLC	Vardhman Acrylics Limited	NSE	Equities	\N	31.29	29.39	31.65	28.20	43522	0.00	2026-04-02 09:14:19.342
VARROC	Varroc Engineering Limited	NSE	Equities	\N	485.00	478.35	490.00	464.30	82905	0.00	2026-04-02 09:14:19.344
VASCONEQ	Vascon Engineers Limited	NSE	Equities	\N	32.20	30.53	32.74	28.25	1968833	0.00	2026-04-02 09:14:19.348
VBL	Varun Beverages Limited	NSE	FMCG	\N	401.75	401.80	405.00	390.60	2805161	0.00	2026-04-02 09:14:19.429
VCL	Vaxtex Cotfab Limited	NSE	Equities	\N	1.33	1.29	1.33	1.25	192159	0.00	2026-04-02 09:14:19.431
VEDL	Vedanta Limited	NSE	Equities	\N	683.60	677.20	687.00	652.80	12952175	0.00	2026-04-02 09:14:19.435
VEEDOL	Veedol Corporation Limited	NSE	Equities	\N	1295.00	1288.80	1305.00	1265.50	8848	0.00	2026-04-02 09:14:19.438
VENTIVE	Ventive Hospitality Limited	NSE	Healthcare	\N	568.95	577.20	576.00	548.40	47726	0.00	2026-04-02 09:14:19.444
VERANDA	Veranda Learning Solutions Limited	NSE	Equities	\N	141.82	143.85	143.50	138.76	69484	0.00	2026-04-02 09:14:19.455
VERTOZ	Vertoz Limited	NSE	Equities	\N	32.61	31.14	33.54	28.05	137558	0.00	2026-04-02 09:14:19.458
VESUVIUS	Vesuvius India Limited	NSE	Equities	\N	455.10	443.65	463.05	436.15	145174	0.00	2026-04-02 09:14:19.461
VETO	Veto Switchgears And Cables Limited	NSE	Equities	\N	94.82	94.13	95.98	90.06	14473	0.00	2026-04-02 09:14:19.464
VGL	VARVEE GLOBAL LIMITED	NSE	Equities	\N	51.30	50.91	52.40	46.50	29277	0.00	2026-04-02 09:14:19.467
VHL	Vardhman Holdings Limited	NSE	Equities	\N	3211.40	3223.80	3223.80	3108.20	514	0.00	2026-04-02 09:14:19.476
VIDHIING	Vidhi Specialty Food Ingredients Limited	NSE	Equities	\N	300.80	298.15	301.50	281.00	6564	0.00	2026-04-02 09:14:19.479
VIDYAWIRES	Vidya Wires Limited	NSE	Equities	\N	51.90	52.43	53.00	50.82	924582	0.00	2026-04-02 09:14:19.483
VIJAYA	Vijaya Diagnostic Centre Limited	NSE	Healthcare	\N	886.35	884.55	894.95	852.60	84874	0.00	2026-04-02 09:14:19.486
VIKASECO	Vikas EcoTech Limited	NSE	Information Technology	\N	1.19	1.13	1.21	1.05	2668745	0.00	2026-04-02 09:14:19.49
VIKASLIFE	Vikas Lifecare Limited	NSE	Equities	\N	1.27	1.24	1.28	1.20	6284151	0.00	2026-04-02 09:14:22.232
VIKRAN	Vikran Engineering Limited	NSE	Equities	\N	54.55	55.57	55.44	52.75	1380364	0.00	2026-04-02 09:14:22.238
VIMTALABS	Vimta Labs Limited	NSE	Equities	\N	403.05	408.20	412.20	391.80	110390	0.00	2026-04-02 09:14:22.241
VINATIORGA	Vinati Organics Limited	NSE	Equities	\N	1307.60	1342.20	1339.90	1307.00	26530	0.00	2026-04-02 09:14:22.244
VINCOFE	Vintage Coffee And Beverages Limited	NSE	Equities	\N	131.43	135.54	134.60	130.30	1304584	0.00	2026-04-02 09:14:22.247
VINDHYATEL	Vindhya Telelinks Limited	NSE	Equities	\N	1071.50	1081.20	1085.00	1035.40	12177	0.00	2026-04-02 09:14:22.249
VINEETLAB	Vineet Laboratories Limited	NSE	Equities	\N	30.05	29.47	30.21	29.32	27901	0.00	2026-04-02 09:14:22.252
VINNY	Vinny Overseas Limited	NSE	Equities	\N	1.03	1.03	1.05	1.00	232341	0.00	2026-04-02 09:14:22.255
VIPCLOTHNG	VIP Clothing Limited	NSE	Equities	\N	19.50	16.99	20.03	16.10	694854	0.00	2026-04-02 09:14:22.261
VIPIND	VIP Industries Limited	NSE	Equities	\N	312.60	316.25	316.00	304.90	73353	0.00	2026-04-02 09:14:22.264
VIRINCHI	Virinchi Limited	NSE	Equities	\N	15.74	15.37	15.80	14.85	100937	0.00	2026-04-02 09:14:22.266
VENUSPIPES	Venus Pipes & Tubes Limited	NSE	Equities	\N	971.00	988.45	984.95	940.10	34073	0.00	2026-04-02 09:14:19.448
VISAKAIND	Visaka Industries Limited	NSE	Equities	\N	56.70	55.09	57.00	53.88	38840	0.00	2026-04-02 09:14:22.27
VISASTEEL	Visa Steel Limited	NSE	Metals & Mining	\N	29.00	29.61	29.72	28.25	9090	0.00	2026-04-02 09:14:22.272
VISHNU	Vishnu Chemicals Limited	NSE	Chemicals	\N	504.50	497.15	511.50	487.10	38994	0.00	2026-04-02 09:14:22.275
VITAL	Vital Chemtech Limited	NSE	Information Technology	\N	47.34	45.09	47.34	45.09	12234	0.00	2026-04-02 09:14:22.28
VIVIDHA	Visagar Polytex Limited	NSE	Equities	\N	0.48	0.48	0.49	0.46	288634	0.00	2026-04-02 09:14:22.283
VIVIMEDLAB	Vivimed Labs Limited	NSE	Equities	\N	5.80	5.53	5.80	5.31	77070	0.00	2026-04-02 09:14:22.286
VIYASH	Viyash Scientific Limited	NSE	Equities	\N	190.53	192.93	192.20	186.00	301316	0.00	2026-04-02 09:14:22.29
VLEGOV	VL E-Governance & IT Solutions Limited	NSE	Equities	\N	10.41	9.47	10.41	8.80	1515281	0.00	2026-04-02 09:14:22.293
VLSFINANCE	VLS Finance Limited	NSE	Equities	\N	220.83	216.40	223.23	210.40	15028	0.00	2026-04-02 09:14:22.296
VMART	V-Mart Retail Limited	NSE	Equities	\N	522.60	483.20	547.00	500.00	15183403	0.00	2026-04-02 09:14:22.299
VMSTMT	VMS TMT Limited	NSE	Equities	\N	37.50	37.63	38.36	36.22	81955	0.00	2026-04-02 09:14:22.305
VOLTAMP	Voltamp Transformers Limited	NSE	Equities	\N	9087.00	9055.00	9108.50	8802.00	26325	0.00	2026-04-02 09:14:22.308
VOLTAS	Voltas Limited	NSE	Equities	\N	1221.40	1249.70	1239.20	1186.80	2208184	0.00	2026-04-02 09:14:22.312
VPRPL	Vishnu Prakash R Punglia Limited	NSE	Equities	\N	34.25	33.64	35.29	31.70	1824598	0.00	2026-04-02 09:14:22.315
VRAJ	Vraj Iron and Steel Limited	NSE	Metals & Mining	\N	104.35	105.29	105.00	101.26	18759	0.00	2026-04-02 09:14:22.318
VRLLOG	VRL Logistics Limited	NSE	Equities	\N	231.19	235.99	234.60	225.00	274071	0.00	2026-04-02 09:14:22.32
VSTIND	VST Industries Limited	NSE	Equities	\N	212.91	211.13	214.70	204.18	180396	0.00	2026-04-02 09:14:22.327
WANBURY	Wanbury Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.668866
WINSOME	Winsome Yarns Limited	NSE	Textile	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.668866
ZEEMEDIA	Zee Media Corporation Limited	NSE	Equities	\N	0.00	0.00	0.00	0.00	0	0.00	2026-04-02 06:11:29.668866
ZUARI	Zuari Agro Chemicals Limited	NSE	Chemicals	\N	197.80	196.37	200.42	189.46	108661	0.00	2026-04-02 09:14:25.325
ZUARIIND	ZUARI INDUSTRIES LIMITED	NSE	Equities	\N	230.50	229.81	232.95	220.20	43932	0.00	2026-04-02 09:14:25.327
ZYDUSWELL	Zydus Wellness Limited	NSE	Equities	\N	442.90	435.75	449.00	420.30	256010	0.00	2026-04-02 09:14:25.332
ZODIACLOTH	Zodiac Clothing Company Limited	NSE	Equities	\N	64.95	66.95	67.00	63.10	9048	0.00	2026-04-02 09:14:25.32
HDFCBANK	HDFC Bank Limited	NSE	Banking	\N	743.80	742.25	749.55	726.65	34083730	0.00	2026-04-02 09:15:13.257
ZOTA	Zota Health Care LImited	NSE	Healthcare	\N	1103.70	1116.20	1113.00	1060.00	31941	0.00	2026-04-02 09:14:25.322
ZYDUSLIFE	Zydus Lifesciences Limited	NSE	Equities	\N	858.15	863.20	862.00	835.50	766632	0.00	2026-04-02 09:14:25.329
WHIRLPOOL	Whirlpool of India Limited	NSE	Equities	\N	810.10	830.25	819.55	798.40	81396	0.00	2026-04-02 09:14:25.238
ZODIAC	Zodiac Energy Limited	NSE	Equities	\N	244.68	241.44	248.00	230.00	12902	0.00	2026-04-02 09:14:25.318
BHARTIARTL	Bharti Airtel Limited	NSE	Telecom	\N	1778.00	1781.90	1783.30	1746.90	7625032	0.00	2026-04-02 09:14:43.315
INFY	Infosys Limited	NSE	Equities	\N	1291.40	1275.70	1297.90	1259.80	7744202	0.00	2026-04-02 09:15:19.321
ITC	ITC Limited	NSE	Equities	\N	292.00	291.70	293.60	288.40	14440243	0.00	2026-04-02 09:15:22.245
KOTAKBANK	Kotak Mahindra Bank Limited	NSE	Banking	\N	354.70	356.05	357.55	345.50	16289924	0.00	2026-04-02 09:15:28.33
RELIANCE	Reliance Industries Limited	NSE	Equities	\N	1347.50	1369.20	1358.00	1328.00	12477210	0.00	2026-04-02 09:13:52.255
SBIN	State Bank of India	NSE	Banking	\N	1007.90	1017.80	1015.70	977.90	14179023	0.00	2026-04-02 09:13:58.284
TCS	Tata Consultancy Services Limited	NSE	Equities	\N	2454.20	2408.20	2469.90	2375.70	4219867	0.00	2026-04-02 09:14:13.244
WAAREERTL	Waaree Renewable Technologies Limited	NSE	Information Technology	\N	847.25	838.55	859.00	810.10	282654	0.00	2026-04-02 09:14:22.342
WABAG	VA Tech Wabag Limited	NSE	Information Technology	\N	1224.30	1236.20	1240.90	1193.00	165866	0.00	2026-04-02 09:14:22.345
WALCHANNAG	Walchandnagar Industries Limited	NSE	Equities	\N	142.40	143.33	143.94	136.00	387105	0.00	2026-04-02 09:14:22.35
WEALTH	Wealth First Portfolio Managers Limited	NSE	Equities	\N	836.90	826.00	836.90	796.80	2250	0.00	2026-04-02 09:14:22.357
WEBELSOLAR	Websol Energy System Limited	NSE	Equities	\N	75.65	71.34	77.50	69.68	16361968	0.00	2026-04-02 09:14:22.359
WEIZMANIND	Weizmann Limited	NSE	Equities	\N	71.99	69.00	74.00	67.76	5849	0.00	2026-04-02 09:14:22.362
WEL	Wonder Electricals Limited	NSE	Equities	\N	79.48	80.77	84.90	77.72	46529380	0.00	2026-04-02 09:14:22.365
WELENT	Welspun Enterprises Limited	NSE	Equities	\N	435.00	438.90	437.45	427.40	24429	0.00	2026-04-02 09:14:22.37
WELINV	Welspun Investments and Commercials Limited	NSE	Equities	\N	1285.00	1265.40	1294.90	1221.00	639	0.00	2026-04-02 09:14:22.373
WAKEFIT	Wakefit Innovations Limited	NSE	Equities	\N	146.94	147.69	148.59	142.23	101095	0.00	2026-04-02 09:14:22.348
WELSPUNLIV	Welspun Living Limited	NSE	Equities	\N	114.23	115.71	115.42	111.02	1050289	0.00	2026-04-02 09:14:22.376
WCIL	Western Carriers (India) Limited	NSE	Equities	\N	82.94	81.01	83.65	78.24	106078	0.00	2026-04-02 09:14:22.353
WESTLIFE	WESTLIFE FOODWORLD LIMITED	NSE	Equities	\N	468.25	461.35	471.00	445.20	37043	0.00	2026-04-02 09:14:25.228
WENDT	Wendt (India) Limited	NSE	Equities	\N	6329.00	6159.50	6396.00	6005.00	15360	0.00	2026-04-02 09:14:25.225
WHEELS	Wheels India Limited	NSE	Equities	\N	977.00	987.55	1006.45	950.30	101034	0.00	2026-04-02 09:14:25.235
WILLAMAGOR	Williamson Magor & Company Limited	NSE	Equities	\N	24.70	23.93	24.84	22.90	16427	0.00	2026-04-02 09:14:25.24
WINDLAS	Windlas Biotech Limited	NSE	Information Technology	\N	774.15	767.65	788.95	747.15	26081	0.00	2026-04-02 09:14:25.243
WINDMACHIN	Windsor Machines Limited	NSE	Equities	\N	221.95	217.86	226.60	214.00	85395	0.00	2026-04-02 09:14:25.246
WOCKPHARMA	Wockhardt Limited	NSE	Equities	\N	1254.10	1267.60	1267.80	1220.60	537872	0.00	2026-04-02 09:14:25.255
WONDERLA	Wonderla Holidays Limited	NSE	Equities	\N	526.00	522.75	530.45	509.30	29049	0.00	2026-04-02 09:14:25.257
WORTHPERI	Worth Peripherals Limited	NSE	Equities	\N	123.50	123.05	126.19	119.00	1278	0.00	2026-04-02 09:14:25.259
WSI	W S Industries (I) Limited	NSE	Equities	\N	72.50	68.38	73.55	67.69	106854	0.00	2026-04-02 09:14:25.262
WIPRO	Wipro Limited	NSE	Equities	\N	194.49	191.18	195.34	188.58	11212441	0.00	2026-04-02 09:14:25.252
WSTCSTPAPR	West Coast Paper Mills Limited	NSE	Equities	\N	430.30	434.45	434.40	416.80	53782	0.00	2026-04-02 09:14:25.265
XCHANGING	Xchanging Solutions Limited	NSE	Equities	\N	54.64	53.13	54.72	51.75	86682	0.00	2026-04-02 09:14:25.268
XPROINDIA	Xpro India Limited	NSE	Equities	\N	1030.00	1038.70	1065.30	1002.80	18752	0.00	2026-04-02 09:14:25.274
XTGLOBAL	Xtglobal Infotech Limited	NSE	Information Technology	\N	29.06	29.61	29.94	27.51	29625	0.00	2026-04-02 09:14:25.276
YASHO	Yasho Industries Limited	NSE	Equities	\N	1390.50	1377.80	1407.80	1320.00	5276	0.00	2026-04-02 09:14:25.279
YESBANK	Yes Bank Limited	NSE	Banking	\N	17.63	17.91	17.78	17.30	79687749	0.00	2026-04-02 09:14:25.287
YUKEN	Yuken India Limited	NSE	Equities	\N	633.65	630.90	640.00	611.05	3114	0.00	2026-04-02 09:14:25.29
ZEEL	Zee Entertainment Enterprises Limited	NSE	Equities	\N	73.60	76.07	74.65	72.38	6804306	0.00	2026-04-02 09:14:25.295
ZEELEARN	Zee Learn Limited	NSE	Equities	\N	4.69	4.70	4.70	4.46	274353	0.00	2026-04-02 09:14:25.297
ZENITHEXPO	Zenith Exports Limited	NSE	Equities	\N	190.00	187.40	190.00	178.03	101	0.00	2026-04-02 09:14:25.3
ZENITHSTL	Zenith Steel Pipes & Industries Limited	NSE	Metals & Mining	\N	4.72	4.80	4.88	4.56	80180	0.00	2026-04-02 09:14:25.303
YATRA	Yatra Online Limited	NSE	Equities	\N	95.91	98.39	98.27	92.50	1603849	0.00	2026-04-02 09:14:25.284
YATHARTH	Yatharth Hospital & Trauma Care Services Limited	NSE	Healthcare	\N	667.70	666.65	679.90	641.00	347542	0.00	2026-04-02 09:14:25.282
ZENSARTECH	Zensar Technologies Limited	NSE	Information Technology	\N	544.90	538.20	549.45	519.25	322575	0.00	2026-04-02 09:14:25.306
ZENTEC	Zen Technologies Limited	NSE	Information Technology	\N	1353.00	1345.40	1368.60	1295.00	265913	0.00	2026-04-02 09:14:25.309
ZIMLAB	Zim Laboratories Limited	NSE	Equities	\N	65.94	64.38	67.69	62.04	45254	0.00	2026-04-02 09:14:25.315
ANUHPHR	Anuh Pharma Limited	NSE	Pharmaceuticals	\N	73.60	72.98	73.95	71.29	17441	0.00	2026-04-02 09:14:34.285
ASTRAMICRO	Astra Microwave Products Limited	NSE	Equities	\N	936.60	897.15	949.25	872.55	671159	0.00	2026-04-02 09:14:37.312
ASIANTILES	Asian Granito India Limited	NSE	Equities	\N	56.60	58.42	58.26	56.35	2169363	0.00	2026-04-02 09:14:37.291
ADVANIHOTR	Advani Hotels & Resorts (India) Limited	NSE	Equities	\N	50.50	49.93	50.50	48.42	19427	0.00	2026-04-02 09:14:28.348
ADOR	Ador Welding Limited	NSE	Equities	\N	868.55	893.25	892.35	866.05	15157	0.00	2026-04-02 09:14:28.336
BYKE	The Byke Hospitality Ltd	NSE	Healthcare	\N	36.18	30.15	36.18	28.56	519742	0.00	2026-04-02 09:14:46.305
HINDUNILVR	Hindustan Unilever Limited	NSE	FMCG	\N	2052.90	2064.70	2060.30	2022.50	1012693	0.00	2026-04-02 09:15:13.339
63MOONS	63 moons technologies limited	NSE	Information Technology	\N	495.20	504.30	499.80	486.05	181682	0.00	2026-04-02 09:08:04.233
NESTLEIND	Nestle India Limited	NSE	FMCG	\N	1194.60	1180.80	1197.80	1159.40	870326	0.00	2026-04-02 09:13:37.355
ABSLAMC	Aditya Birla Sun Life AMC Limited	NSE	Equities	\N	927.55	901.40	928.00	872.40	225869	0.00	2026-04-02 09:14:28.285
AJANTPHARM	Ajanta Pharma Limited	NSE	Pharmaceuticals	\N	2786.10	2816.80	2816.80	2722.80	40763	0.00	2026-04-02 09:14:31.294
AERONEU	Aeroflex Neu Limited	NSE	Equities	\N	77.20	75.36	78.99	72.51	51531	0.00	2026-04-02 09:14:31.234
ACUTAAS	Acutaas Chemicals Limited	NSE	Chemicals	\N	2122.00	2332.10	2281.10	2095.00	1096660	0.00	2026-04-02 09:14:28.314
AFSL	Abans Financial Services Limited	NSE	Equities	\N	201.36	201.10	202.00	201.02	1401	0.00	2026-04-02 09:14:31.249
ABCOTS	A B Cotspin India Limited	NSE	Equities	\N	405.70	402.65	406.80	399.75	22582	0.00	2026-04-02 09:14:28.269
AKSHARCHEM	AksharChem India Limited	NSE	Equities	\N	161.26	155.42	162.89	151.01	4176	0.00	2026-04-02 09:14:31.317
AGARIND	Agarwal Industrial Corporation Limited	NSE	Equities	\N	380.25	391.95	390.00	371.00	28214	0.00	2026-04-02 09:14:31.252
21STCENMGM	21st Century Management Services Limited	NSE	Equities	\N	28.82	29.40	29.40	28.82	1230	0.00	2026-04-02 08:51:01.291
ALEMBICLTD	Alembic Limited	NSE	Equities	\N	77.16	76.49	78.00	73.41	237823	0.00	2026-04-02 09:14:31.334
ADANIENT	Adani Enterprises Limited	NSE	Equities	\N	1807.00	1842.50	1823.80	1770.10	1487403	0.00	2026-04-02 09:14:28.319
ANDHRSUGAR	The Andhra Sugars Limited	NSE	Equities	\N	72.54	73.13	73.26	71.20	75950	0.00	2026-04-02 09:14:34.266
AMAGI	Amagi Media Labs Limited	NSE	Equities	\N	317.80	329.15	322.00	315.85	28066	0.00	2026-04-02 09:14:31.377
APOLSINHOT	Apollo Sindoori Hotels Limited	NSE	Equities	\N	1006.60	1006.75	1039.00	1000.40	857	0.00	2026-04-02 09:14:34.319
AMIRCHAND	Amir Chand Jagdish Kumar (Exports) Limited	NSE	Equities	\N	180.00	212.00	200.00	180.00	17574976	0.00	2026-04-02 09:14:34.247
AHLADA	Ahlada Engineers Limited	NSE	Equities	\N	34.94	35.31	35.79	34.66	14930	0.00	2026-04-02 09:14:31.272
ASHIANA	Ashiana Housing Limited	NSE	Equities	\N	306.25	300.05	309.95	292.80	32374	0.00	2026-04-02 09:14:37.268
ARE&M	Amara Raja Energy & Mobility Limited	NSE	Equities	\N	722.10	713.90	729.00	690.90	335820	0.00	2026-04-02 09:14:34.335
ALLCARGO	Allcargo Logistics Limited	NSE	Equities	\N	7.68	7.72	7.81	7.32	3456840	0.00	2026-04-02 09:14:31.359
ASIANPAINT	Asian Paints Limited	NSE	Chemicals	\N	2162.70	2225.80	2185.10	2142.40	1338951	0.00	2026-04-02 09:14:37.288
ARMANFIN	Arman Financial Services Limited	NSE	Equities	\N	1503.50	1484.80	1520.00	1426.10	32979	0.00	2026-04-02 09:14:34.363
ATLANTAELE	Atlanta Electricals Limited	NSE	Equities	\N	1203.10	1204.30	1239.00	1187.20	196103	0.00	2026-04-02 09:14:37.343
ARVINDFASN	Arvind Fashions Limited	NSE	Equities	\N	423.30	411.35	426.35	395.10	530398	0.00	2026-04-02 09:14:37.245
BAJAJFINSV	Bajaj Finserv Limited	NSE	Equities	\N	1618.80	1647.00	1639.90	1597.00	1719104	0.00	2026-04-02 09:14:40.356
AVONMORE	Avonmore Capital & Management Services Limited	NSE	Equities	\N	11.10	11.41	11.61	11.05	168321	0.00	2026-04-02 09:14:40.307
APEX	Apex Frozen Foods Limited	NSE	Equities	\N	372.10	383.25	379.70	366.00	244441	0.00	2026-04-02 09:14:34.302
BALAJEE	Shree Tirupati Balajee Agro Trading Company Limited	NSE	Equities	\N	24.38	23.11	24.43	22.69	45673	0.00	2026-04-02 09:14:40.376
AYMSYNTEX	AYM Syntex Limited	NSE	Equities	\N	184.11	187.20	189.00	181.66	7159	0.00	2026-04-02 09:14:40.334
BEPL	Bhansali Engineering Polymers Limited	NSE	Equities	\N	86.00	86.25	86.65	83.60	468851	0.00	2026-04-02 09:14:43.276
BANKBARODA	Bank of Baroda	NSE	Banking	\N	246.90	252.03	249.01	241.00	11529182	0.00	2026-04-02 09:14:40.421
BHANDARI	Bhandari Hosiery Exports Limited	NSE	Equities	\N	2.88	2.43	2.91	2.39	1939674	0.00	2026-04-02 09:14:43.296
BASML	Bannari Amman Spinning Mills Limited	NSE	Textile	\N	20.54	19.30	20.95	18.70	198981	0.00	2026-04-02 09:14:40.44
BPCL	Bharat Petroleum Corporation Limited	NSE	Energy	\N	276.25	281.25	277.75	266.60	10502789	0.00	2026-04-02 09:14:46.268
BIOFILCHEM	Biofil Chemicals & Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	28.24	27.55	29.20	27.16	8123	0.00	2026-04-02 09:14:43.332
BEARDSELL	Beardsell Limited	NSE	Equities	\N	23.00	22.36	23.40	20.50	10634	0.00	2026-04-02 09:14:43.257
BALRAMCHIN	Balrampur Chini Mills Limited	NSE	Equities	\N	488.00	494.95	495.00	482.05	470038	0.00	2026-04-02 09:14:40.396
BRNL	Bharat Road Network Limited	NSE	Equities	\N	18.60	18.39	18.61	17.90	29743	0.00	2026-04-02 09:14:46.279
BAJAJCON	Bajaj Consumer Care Limited	NSE	Consumer Goods	\N	357.60	361.70	364.00	348.70	440082	0.00	2026-04-02 09:14:40.351
BLUECOAST	Blue Coast Hotels Limited	NSE	Equities	\N	20.58	19.61	20.58	19.11	1430	0.00	2026-04-02 09:14:43.361
BHEL	Bharat Heavy Electricals Limited	NSE	Equities	\N	247.11	251.84	249.30	240.92	6447208	0.00	2026-04-02 09:14:43.319
COALINDIA	Coal India Limited	NSE	Equities	\N	449.75	449.40	453.30	440.50	5505968	0.00	2026-04-02 09:14:49.469
BLUSPRING	Bluspring Enterprises Limited	NSE	Equities	\N	57.40	54.34	57.79	52.25	193470	0.00	2026-04-02 09:14:46.243
MARUTI	Maruti Suzuki India Limited	NSE	Automobile	\N	12583.00	12509.00	12673.00	12239.00	329573	0.00	2026-04-02 09:13:28.298
COMPUSOFT	Compucom Software Limited	NSE	Information Technology	\N	13.55	12.47	13.99	12.33	28840	0.00	2026-04-02 09:14:49.487
AARTIPHARM	Aarti Pharmalabs Limited	NSE	Pharmaceuticals	\N	639.45	635.05	650.50	614.95	150640	0.00	2026-04-02 09:14:28.251
ONGC	Oil & Natural Gas Corporation Limited	NSE	Energy	\N	287.00	288.05	288.80	283.50	16322652	0.00	2026-04-02 09:13:40.275
SUNPHARMA	Sun Pharmaceutical Industries Limited	NSE	Pharmaceuticals	\N	1685.00	1728.50	1695.40	1620.00	3154265	0.00	2026-04-02 09:14:07.365
BSOFT	BIRLASOFT LIMITED	NSE	Equities	\N	374.50	349.65	374.90	340.70	1381529	0.00	2026-04-02 09:14:46.294
CARTRADE	Cartrade Tech Limited	NSE	Information Technology	\N	1677.10	1756.20	1738.00	1649.00	218937	0.00	2026-04-02 09:14:46.348
CDSL	Central Depository Services (India) Limited	NSE	Equities	\N	1173.20	1182.80	1182.60	1136.10	1731991	0.00	2026-04-02 09:14:49.235
CENTEXT	Century Extrusions Limited	NSE	Equities	\N	18.73	18.26	18.77	17.30	48499	0.00	2026-04-02 09:14:49.261
CEWATER	Concord Enviro Systems Limited	NSE	Equities	\N	279.75	277.00	283.80	267.85	65847	0.00	2026-04-02 09:14:49.284
CHEMCON	Chemcon Speciality Chemicals Limited	NSE	Chemicals	\N	139.01	139.87	141.06	133.06	30963	0.00	2026-04-02 09:14:49.31
CHOLAFIN	Cholamandalam Investment and Finance Company Limited	NSE	Equities	\N	1350.90	1373.60	1362.00	1299.40	1966509	0.00	2026-04-02 09:14:49.408
CIPLA	Cipla Limited	NSE	Equities	\N	1190.90	1195.90	1195.00	1165.70	2005806	0.00	2026-04-02 09:14:49.441
CMPDI	Central Mine Planning & Design Institute Limited	NSE	Equities	\N	156.00	160.10	156.50	153.25	660024	0.00	2026-04-02 09:14:49.458
VIKRAMSOLR	Vikram Solar Limited	NSE	Equities	\N	182.64	183.18	184.60	176.50	1198487	0.00	2026-04-02 09:14:22.235
CSBBANK	CSB Bank Limited	NSE	Banking	\N	363.65	360.05	367.40	343.05	365169	0.00	2026-04-02 09:14:52.295
CYBERMEDIA	Cyber Media (India) Limited	NSE	Equities	\N	13.48	12.54	13.48	12.01	7716	0.00	2026-04-02 09:14:52.313
DALMIASUG	Dalmia Bharat Sugar and Industries Limited	NSE	Equities	\N	364.20	383.45	382.65	360.10	1863988	0.00	2026-04-02 09:14:52.328
DBEIL	Deepak Builders & Engineers India Limited	NSE	Real Estate	\N	59.56	59.38	61.50	56.18	72949	0.00	2026-04-02 09:14:52.349
DBREALTY	Valor Estate Limited	NSE	Equities	\N	89.31	91.56	90.45	85.00	1065955	0.00	2026-04-02 09:14:52.358
DCI	Dc Infotech And Communication Limited	NSE	Information Technology	\N	318.00	316.15	321.75	313.10	27480	0.00	2026-04-02 09:14:55.236
DEEDEV	DEE Development Engineers Limited	NSE	Equities	\N	297.45	289.20	306.00	277.65	844032	0.00	2026-04-02 09:14:55.267
DELTAMAGNT	Delta Manufacturing Limited	NSE	Equities	\N	52.01	50.17	53.99	48.40	3759	0.00	2026-04-02 09:14:55.289
DGCONTENT	Digicontent Limited	NSE	Equities	\N	23.89	23.66	23.97	23.57	2645	0.00	2026-04-02 09:14:55.311
DHRUV	Dhruv Consultancy Services Limited	NSE	Equities	\N	32.50	29.59	32.54	28.21	9627	0.00	2026-04-02 09:14:55.329
DIGISPICE	DiGiSPICE Technologies Limited	NSE	Information Technology	\N	16.15	16.02	16.25	15.76	77710	0.00	2026-04-02 09:14:55.355
DLINKINDIA	D-Link (India) Limited	NSE	Equities	\N	396.95	395.55	398.20	385.65	34952	0.00	2026-04-02 09:14:55.379
DREDGECORP	Dredging Corporation of India Limited	NSE	Equities	\N	826.40	829.35	842.15	794.00	95458	0.00	2026-04-02 09:14:58.264
DOLPHIN	Dolphin Offshore Enterprises (India) Limited	NSE	Equities	\N	403.75	402.85	409.65	393.85	18479	0.00	2026-04-02 09:14:58.236
DSFCL	DCM Shriram Fine Chemicals Limited	NSE	Chemicals	\N	18.68	18.92	19.87	17.65	88255	0.00	2026-04-02 09:14:58.269
DYNAMATECH	Dynamatic Technologies Limited	NSE	Information Technology	\N	9286.00	9388.50	9440.50	9094.50	9910	0.00	2026-04-02 09:14:58.29
EICHERMOT	Eicher Motors Limited	NSE	Automobile	\N	6633.00	6825.50	6766.00	6585.00	460858	0.00	2026-04-02 09:14:58.316
EIMCOELECO	Eimco Elecon (India) Limited	NSE	Equities	\N	1555.60	1548.50	1575.00	1502.70	4520	0.00	2026-04-02 09:14:58.337
ELGIRUBCO	Elgi Rubber Company Limited	NSE	Equities	\N	39.18	38.82	40.00	37.45	24369	0.00	2026-04-02 09:14:58.361
EMCURE	Emcure Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	1535.10	1590.10	1585.50	1457.00	370291	0.00	2026-04-02 09:14:58.378
ENDURANCE	Endurance Technologies Limited	NSE	Information Technology	\N	2208.60	2252.00	2235.00	2142.80	47831	0.00	2026-04-02 09:15:01.257
EPACKPEB	EPack Prefab Technologies Limited	NSE	Information Technology	\N	144.47	138.77	145.70	133.10	498374	0.00	2026-04-02 09:15:01.278
ESTER	Ester Industries Limited	NSE	Equities	\N	78.75	82.22	82.50	77.25	221722	0.00	2026-04-02 09:15:01.306
EVEREADY	Eveready Industries India Limited	NSE	Equities	\N	278.15	277.50	283.50	264.85	114047	0.00	2026-04-02 09:15:01.327
EVERESTIND	Everest Industries Limited	NSE	Equities	\N	331.25	314.35	344.90	302.25	14118	0.00	2026-04-02 09:15:01.33
FABTECH	Fabtech Technologies Limited	NSE	Information Technology	\N	143.99	142.36	145.39	138.28	122804	0.00	2026-04-02 09:15:01.348
HCC	Hindustan Construction Company Limited	NSE	Equities	\N	15.19	15.13	15.54	14.45	20242279	0.00	2026-04-02 09:15:13.236
FEDFINA	Fedbank Financial Services Limited	NSE	Banking	\N	134.99	130.60	136.10	125.85	673654	0.00	2026-04-02 09:15:01.367
FISCHER	Fischer Medical Ventures Limited	NSE	Equities	\N	40.34	41.17	40.79	39.80	367335	0.00	2026-04-02 09:15:04.25
FOCUS	Focus Lighting and Fixtures Limited	NSE	Equities	\N	61.99	62.51	62.69	61.01	17370	0.00	2026-04-02 09:15:04.271
GANDHAR	Gandhar Oil Refinery (India) Limited	NSE	Equities	\N	124.81	124.52	125.19	120.30	90044	0.00	2026-04-02 09:15:04.317
GABRIEL	Gabriel India Limited	NSE	Equities	\N	880.50	866.20	892.00	835.80	257582	0.00	2026-04-02 09:15:04.298
EUROTEXIND	Eurotex Industries and Exports Limited	NSE	Equities	\N	13.38	13.12	13.38	13.38	1	0.00	2026-04-02 09:15:01.323
GANGESSECU	Ganges Securities Limited	NSE	Equities	\N	112.00	110.37	114.39	109.26	5877	0.00	2026-04-02 09:15:04.338
GCSL	Gretex Corporate Services Limited	NSE	Equities	\N	347.85	340.40	348.00	335.00	18616	0.00	2026-04-02 09:15:04.378
GHCL	GHCL Limited	NSE	Equities	\N	447.55	445.20	455.75	430.95	94461	0.00	2026-04-02 09:15:04.41
GILLANDERS	Gillanders Arbuthnot & Company Limited	NSE	Equities	\N	83.36	81.87	85.10	78.66	1230	0.00	2026-04-02 09:15:07.254
GLAXO	GlaxoSmithKline Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	2298.00	2329.20	2339.80	2261.90	80765	0.00	2026-04-02 09:15:07.283
GLOTTIS	Glottis Limited	NSE	Equities	\N	42.94	40.92	43.00	39.17	111078	0.00	2026-04-02 09:15:07.468
GNFC	Gujarat Narmada Valley Fertilizers and Chemicals Limited	NSE	Chemicals	\N	393.20	391.25	400.75	375.60	264935	0.00	2026-04-02 09:15:07.488
GODREJCP	Godrej Consumer Products Limited	NSE	FMCG	\N	994.90	997.55	998.45	967.05	1145190	0.00	2026-04-02 09:15:07.511
GPTINFRA	GPT Infraprojects Limited	NSE	Equities	\N	102.80	103.47	104.71	99.50	201498	0.00	2026-04-02 09:15:07.559
GREENPOWER	Orient Green Power Company Limited	NSE	Equities	\N	9.11	8.98	9.27	8.56	6515616	0.00	2026-04-02 09:15:10.273
GOLDIAM	Goldiam International Limited	NSE	Equities	\N	287.55	290.40	291.30	276.10	261133	0.00	2026-04-02 09:15:07.534
GRSE	Garden Reach Shipbuilders & Engineers Limited	NSE	Real Estate	\N	2225.10	2359.30	2312.00	2190.00	3675939	0.00	2026-04-02 09:15:10.303
GTLINFRA	GTL Infrastructure Limited	NSE	Equities	\N	1.02	1.03	1.03	1.00	46344624	0.00	2026-04-02 09:15:10.331
GUJRAFFIA	Gujarat Raffia Industries Limited	NSE	Equities	\N	38.39	37.62	39.00	38.00	491	0.00	2026-04-02 09:15:10.354
HAL	Hindustan Aeronautics Limited	NSE	Equities	\N	3632.60	3670.80	3672.90	3551.00	1337177	0.00	2026-04-02 09:15:10.386
HARSHA	Harsha Engineers International Limited	NSE	Equities	\N	333.75	330.85	336.80	321.30	14805	0.00	2026-04-02 09:15:10.41
HEIDELBERG	HeidelbergCement India Limited	NSE	Equities	\N	145.04	145.72	146.78	140.91	67987	0.00	2026-04-02 09:15:13.271
HEXT	Hexaware Technologies Limited	NSE	Information Technology	\N	434.05	432.40	442.20	422.70	2949096	0.00	2026-04-02 09:15:13.293
HIMATSEIDE	Himatsingka Seide Limited	NSE	Equities	\N	79.29	78.09	80.50	74.92	475039	0.00	2026-04-02 09:15:13.317
HINDPETRO	Hindustan Petroleum Corporation Limited	NSE	Energy	\N	322.95	335.55	329.65	318.25	5870562	0.00	2026-04-02 09:15:13.336
HMAAGRO	HMA Agro Industries Limited	NSE	Equities	\N	23.77	23.38	24.00	22.81	59072	0.00	2026-04-02 09:15:13.371
HONDAPOWER	Honda India Power Products Limited	NSE	Equities	\N	1976.80	1950.90	2010.30	1900.10	4238	0.00	2026-04-02 09:15:13.388
MITCON	MITCON Consultancy & Engineering Services Limited	NSE	Equities	\N	59.00	58.47	59.79	56.13	2974	0.00	2026-04-02 09:13:31.282
KOTARISUG	Kothari Sugars And Chemicals Limited	NSE	Chemicals	\N	23.84	23.50	23.85	23.05	26593	0.00	2026-04-02 09:15:28.334
MODISONLTD	MODISON LIMITED	NSE	Equities	\N	125.80	125.03	127.75	121.59	26674	0.00	2026-04-02 09:13:31.309
ICICIGI	ICICI Lombard General Insurance Company Limited	NSE	Financial Services	\N	1673.50	1694.90	1690.00	1629.50	991423	0.00	2026-04-02 09:15:16.303
IFCI	IFCI Limited	NSE	Equities	\N	51.68	52.11	52.40	49.93	12958141	0.00	2026-04-02 09:15:16.354
IGIL	International Gemmological Institute (India) Limited	NSE	Equities	\N	318.30	324.15	320.90	314.00	190293	0.00	2026-04-02 09:15:16.371
IKS	Inventurus Knowledge Solutions Limited	NSE	Equities	\N	1337.70	1331.50	1352.00	1302.50	105910	0.00	2026-04-02 09:15:16.399
INDHOTEL	The Indian Hotels Company Limited	NSE	Equities	\N	577.15	585.20	583.00	565.00	3058723	0.00	2026-04-02 09:15:16.43
INDIASHLTR	India Shelter Finance Corporation Limited	NSE	Equities	\N	760.75	755.25	767.40	727.05	25847	0.00	2026-04-02 09:15:19.249
INDOFARM	Indo Farm Equipment Limited	NSE	Equities	\N	122.70	124.60	125.00	118.61	98185	0.00	2026-04-02 09:15:19.274
INDRAMEDCO	Indraprastha Medical Corporation Limited	NSE	Equities	\N	399.05	399.70	405.05	383.50	186938	0.00	2026-04-02 09:15:19.296
INGERRAND	Ingersoll Rand (India) Limited	NSE	Equities	\N	3650.20	3633.10	3666.50	3564.80	6070	0.00	2026-04-02 09:15:19.325
INSECTICID	Insecticides (India) Limited	NSE	Equities	\N	602.80	582.75	604.85	561.25	61640	0.00	2026-04-02 09:15:19.349
IOLCP	IOL Chemicals and Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	76.50	77.43	77.60	73.81	692580	0.00	2026-04-02 09:15:19.378
IRCTC	Indian Railway Catering And Tourism Corporation Limited	NSE	Equities	\N	506.35	511.20	510.25	497.00	849856	0.00	2026-04-02 09:15:19.396
IRISDOREME	Iris Clothings Limited	NSE	Equities	\N	31.50	31.86	31.54	30.57	245756	0.00	2026-04-02 09:15:19.411
IVALUE	Ivalue Infosolutions Limited	NSE	Equities	\N	215.00	220.11	219.98	212.40	104757	0.00	2026-04-02 09:15:22.258
JAGSNPHARM	Jagsonpal Pharmaceuticals Limited	NSE	Pharmaceuticals	\N	186.00	185.66	187.00	184.00	44331	0.00	2026-04-02 09:15:22.275
JAYBARMARU	Jay Bharat Maruti Limited	NSE	Automobile	\N	82.51	83.52	83.89	79.00	161323	0.00	2026-04-02 09:15:22.412
JHS	JHS Svendgaard Laboratories Limited	NSE	Equities	\N	7.60	7.23	8.40	6.78	67118	0.00	2026-04-02 09:15:22.444
JINDWORLD	Jindal Worldwide Limited	NSE	Equities	\N	19.97	20.18	20.25	19.19	448434	0.00	2026-04-02 09:15:22.463
JKLAKSHMI	JK Lakshmi Cement Limited	NSE	Equities	\N	582.15	589.35	588.75	566.00	76359	0.00	2026-04-02 09:15:22.483
JPOLYINVST	Jindal Poly Investment and Finance Company Limited	NSE	Equities	\N	1068.70	1078.50	1083.90	1045.80	8935	0.00	2026-04-02 09:15:25.243
JSWHL	JSW Holdings Limited	NSE	Equities	\N	11790.00	11762.00	11920.00	11351.00	2996	0.00	2026-04-02 09:15:25.27
JUBLCPL	Jubilant Agri and Consumer Products Limited	NSE	Consumer Goods	\N	1670.00	1663.60	1700.00	1600.20	5591	0.00	2026-04-02 09:15:25.285
JUSTDIAL	Just Dial Limited	NSE	Equities	\N	511.15	516.60	516.50	498.60	88685	0.00	2026-04-02 09:15:25.309
LTTS	L&T Technology Services Limited	NSE	Information Technology	\N	3321.40	3324.00	3355.00	3210.20	50037	0.00	2026-04-02 09:13:25.289
KABRAEXTRU	Kabra Extrusion Technik Limited	NSE	Information Technology	\N	203.57	199.37	204.89	190.81	23289	0.00	2026-04-02 09:15:25.325
KAMOPAINTS	Kamdhenu Ventures Limited	NSE	Equities	\N	4.20	4.09	4.31	3.90	312209	0.00	2026-04-02 09:15:25.359
KAUSHALYA	Kaushalya Infrastructure Development Corporation Limited	NSE	Equities	\N	798.20	791.50	819.00	775.40	99	0.00	2026-04-02 09:15:25.378
KEEPLEARN	DSJ Keep Learning Limited	NSE	Equities	\N	1.77	1.84	1.84	1.62	40636	0.00	2026-04-02 09:15:25.409
KHAICHEM	Khaitan Chemicals & Fertilizers Limited	NSE	Chemicals	\N	50.62	48.81	51.65	47.91	442020	0.00	2026-04-02 09:15:28.255
KINGFA	Kingfa Science & Technology (India) Limited	NSE	Information Technology	\N	4181.90	4194.80	4255.90	4101.70	2506	0.00	2026-04-02 09:15:28.272
KMSUGAR	K.M.Sugar Mills Limited	NSE	Equities	\N	25.70	25.91	25.99	25.40	83020	0.00	2026-04-02 09:15:28.307
KOTHARIPRO	Kothari Products Limited	NSE	Equities	\N	62.09	61.99	62.09	59.22	5807	0.00	2026-04-02 09:15:28.339
KREBSBIO	Krebs Biochemicals and Industries Limited	NSE	Chemicals	\N	47.01	44.44	47.70	42.40	2251	0.00	2026-04-02 09:15:28.36
KRITINUT	Kriti Nutrients Limited	NSE	Equities	\N	58.91	57.35	61.59	56.00	20153	0.00	2026-04-02 09:15:28.376
KSCL	Kaveri Seed Company Limited	NSE	Equities	\N	830.60	833.95	842.00	805.05	116300	0.00	2026-04-02 09:15:31.273
LAGNAM	Lagnam Spintex Limited	NSE	Equities	\N	63.20	64.05	64.37	61.35	1526	0.00	2026-04-02 09:15:31.294
LASA	Lasa Supergenerics Limited	NSE	Equities	\N	6.24	5.95	6.24	5.95	13815	0.00	2026-04-02 09:15:31.317
LEMONTREE	Lemon Tree Hotels Limited	NSE	Equities	\N	107.41	107.80	108.20	103.80	2328210	0.00	2026-04-02 09:15:31.337
LLOYDSENGG	LLOYDS ENGINEERING WORKS LIMITED	NSE	Equities	\N	41.36	41.46	42.16	39.36	5488767	0.00	2026-04-02 09:15:31.382
LODHA	Lodha Developers Limited	NSE	Equities	\N	686.15	685.35	690.40	650.80	3096383	0.00	2026-04-02 09:15:31.392
LOTUSDEV	Sri Lotus Developers and Realty Limited	NSE	Real Estate	\N	111.86	112.55	113.65	107.40	614143	0.00	2026-04-02 09:15:31.404
M&MFIN	Mahindra & Mahindra Financial Services Limited	NSE	Equities	\N	283.40	289.70	285.60	276.05	1747661	0.00	2026-04-02 09:13:25.314
MAHABANK	Bank of Maharashtra	NSE	Banking	\N	63.57	64.88	64.21	61.20	16337554	0.00	2026-04-02 09:13:25.337
MAHSCOOTER	Maharashtra Scooters Limited	NSE	Equities	\N	11275.00	11261.00	11378.00	10901.00	3409	0.00	2026-04-02 09:13:25.355
MANAKSTEEL	Manaksia Steels Limited	NSE	Metals & Mining	\N	50.96	48.85	50.96	48.11	4794	0.00	2026-04-02 09:13:28.238
MANINFRA	Man Infraconstruction Limited	NSE	Equities	\N	84.20	85.36	85.07	80.30	1719633	0.00	2026-04-02 09:13:28.258
MARALOVER	Maral Overseas Limited	NSE	Equities	\N	39.00	37.33	39.50	35.71	5731	0.00	2026-04-02 09:13:28.28
MASTERTR	Master Trust Limited	NSE	Equities	\N	75.70	67.60	78.90	63.05	810491	0.00	2026-04-02 09:13:28.311
MAZDA	Mazda Limited	NSE	Equities	\N	177.80	176.36	178.00	170.21	10730	0.00	2026-04-02 09:13:28.329
MCLEODRUSS	Mcleod Russel India Limited	NSE	Equities	\N	34.70	31.86	34.90	31.92	674165	0.00	2026-04-02 09:13:28.344
MEDPLUS	Medplus Health Services Limited	NSE	Equities	\N	832.25	827.95	833.00	814.00	15505	0.00	2026-04-02 09:13:28.361
METROPOLIS	Metropolis Healthcare Limited	NSE	Healthcare	\N	424.80	424.25	430.90	412.25	414716	0.00	2026-04-02 09:13:31.24
MIDHANI	Mishra Dhatu Nigam Limited	NSE	Equities	\N	289.20	289.10	293.00	277.00	865479	0.00	2026-04-02 09:13:31.264
RUSTOMJEE	Keystone Realtors Limited	NSE	Equities	\N	373.95	381.10	376.25	366.85	8413	0.00	2026-04-02 09:13:55.274
SADBHIN	Sadbhav Infrastructure Project Limited	NSE	Equities	\N	2.19	2.14	2.19	2.06	488932	0.00	2026-04-02 09:13:55.288
SAILIFE	Sai Life Sciences Limited	NSE	Equities	\N	958.85	976.85	975.90	944.05	488699	0.00	2026-04-02 09:13:55.314
SALSTEEL	S.A.L. Steel Limited	NSE	Metals & Mining	\N	39.95	38.13	40.19	36.82	102299	0.00	2026-04-02 09:13:55.339
SAMBHAAV	Sambhaav Media Limited	NSE	Equities	\N	5.70	5.47	5.74	5.28	34793	0.00	2026-04-02 09:13:55.345
MRF	MRF Limited	NSE	Equities	\N	126105.00	129095.00	128500.00	125600.00	5535	0.00	2026-04-02 09:13:31.374
MTARTECH	Mtar Technologies Limited	NSE	Information Technology	\N	3550.00	3603.60	3601.90	3451.10	115415	0.00	2026-04-02 09:13:34.233
MUNJALAU	Munjal Auto Industries Limited	NSE	Equities	\N	71.95	71.74	72.48	69.13	87312	0.00	2026-04-02 09:13:34.258
NACLIND	NACL Industries Limited	NSE	Equities	\N	138.15	131.58	138.15	131.59	862658	0.00	2026-04-02 09:13:34.283
NAHARPOLY	Nahar Poly Films Limited	NSE	Equities	\N	228.06	236.47	232.65	221.32	8139	0.00	2026-04-02 09:13:34.3
NBIFIN	N. B. I. Industrial Finance Company Limited	NSE	Equities	\N	1680.00	1674.40	1694.90	1608.20	246	0.00	2026-04-02 09:13:34.345
NDTV	New Delhi Television Limited	NSE	Equities	\N	68.17	68.41	69.82	64.07	320144	0.00	2026-04-02 09:13:34.364
NETWEB	Netweb Technologies India Limited	NSE	Information Technology	\N	3125.90	3144.10	3165.00	3043.30	483202	0.00	2026-04-02 09:13:37.357
NEWGEN	Newgen Software Technologies Limited	NSE	Information Technology	\N	439.15	431.80	443.70	414.00	931981	0.00	2026-04-02 09:13:37.436
NIBL	NRB Industrial Bearings Limited	NSE	Equities	\N	27.51	27.66	27.99	25.75	4807	0.00	2026-04-02 09:13:37.459
NIPPOBATRY	Indo-National Limited	NSE	Equities	\N	288.90	285.65	295.40	277.10	11137	0.00	2026-04-02 09:13:37.477
NMDC	NMDC Limited	NSE	Equities	\N	77.38	78.17	78.07	75.61	20290718	0.00	2026-04-02 09:13:37.496
NPST	Network People Services Technologies Limited	NSE	Information Technology	\N	1111.35	1117.90	1130.00	1036.50	48014	0.00	2026-04-02 09:13:37.509
NUVAMA	Nuvama Wealth Management Limited	NSE	Equities	\N	1138.70	1138.90	1149.40	1109.50	281740	0.00	2026-04-02 09:13:37.536
ODIGMA	Odigma Consultancy Solutions Limited	NSE	Equities	\N	22.40	22.34	22.90	21.75	8311	0.00	2026-04-02 09:13:40.239
OMFREIGHT	Om Freight Forwarders Limited	NSE	Equities	\N	69.02	66.34	72.40	63.61	32373	0.00	2026-04-02 09:13:40.261
ONWARDTEC	Onward Technologies Limited	NSE	Information Technology	\N	231.11	225.60	235.60	211.05	82860	0.00	2026-04-02 09:13:40.279
ORCHPHARMA	Orchid Pharma Limited	NSE	Pharmaceuticals	\N	516.50	519.30	520.90	498.10	96138	0.00	2026-04-02 09:13:40.289
ORIENTALTL	Oriental Trimex Limited	NSE	Equities	\N	6.20	5.17	6.20	4.88	458741	0.00	2026-04-02 09:13:40.296
ORIENTPPR	Orient Paper & Industries Limited	NSE	Equities	\N	16.19	16.09	16.40	15.32	362849	0.00	2026-04-02 09:13:40.313
OSWALSEEDS	ShreeOswal Seeds And Chemicals Limited	NSE	Chemicals	\N	10.38	10.38	10.65	10.00	36305	0.00	2026-04-02 09:13:40.336
PALREDTEC	Palred Technologies Limited	NSE	Information Technology	\N	29.86	28.86	30.24	28.72	1753	0.00	2026-04-02 09:13:40.352
PARAS	Paras Defence and Space Technologies Limited	NSE	Information Technology	\N	628.65	638.80	634.00	612.00	563445	0.00	2026-04-02 09:13:43.243
PATINTLOG	Patel Integrated Logistics Limited	NSE	Equities	\N	9.33	9.29	9.48	9.00	69399	0.00	2026-04-02 09:13:43.266
PEARLPOLY	Pearl Polymers Limited	NSE	Equities	\N	15.01	13.83	15.38	13.40	23138	0.00	2026-04-02 09:13:43.285
PFOCUS	Prime Focus Limited	NSE	Equities	\N	334.60	337.30	339.65	325.55	2960679	0.00	2026-04-02 09:13:43.303
PHOENIXLTD	The Phoenix Mills Limited	NSE	Equities	\N	1513.30	1517.60	1519.20	1466.20	308103	0.00	2026-04-02 09:13:43.318
PITTIENG	Pitti Engineering Limited	NSE	Equities	\N	729.05	736.75	734.75	710.65	47437	0.00	2026-04-02 09:13:43.342
PNBHOUSING	PNB Housing Finance Limited	NSE	Equities	\N	779.90	780.05	783.00	754.30	910901	0.00	2026-04-02 09:13:46.241
PODDARMENT	Poddar Pigments Limited	NSE	Chemicals	\N	208.39	208.00	210.52	205.25	1527	0.00	2026-04-02 09:13:46.258
POONAWALLA	Poonawalla Fincorp Limited	NSE	Equities	\N	384.00	382.65	386.75	366.70	757945	0.00	2026-04-02 09:13:46.33
POWERGRID	Power Grid Corporation of India Limited	NSE	Equities	\N	287.60	292.80	290.60	283.50	13004793	0.00	2026-04-02 09:13:46.332
PRAENG	Prajay Engineers Syndicate Limited	NSE	Equities	\N	21.24	19.31	21.24	18.87	61887	0.00	2026-04-02 09:13:46.353
PRECWIRE	Precision Wires India Limited	NSE	Equities	\N	295.35	308.10	305.00	290.55	595454	0.00	2026-04-02 09:13:46.371
PRINCEPIPE	Prince Pipes And Fittings Limited	NSE	Equities	\N	221.43	223.28	225.95	210.00	203807	0.00	2026-04-02 09:13:46.389
PRSMJOHNSN	Prism Johnson Limited	NSE	Equities	\N	123.09	124.69	124.70	120.25	136698	0.00	2026-04-02 09:13:46.407
PTL	PTL Enterprises Limited	NSE	Equities	\N	37.22	37.55	37.65	37.07	12298	0.00	2026-04-02 09:13:49.238
PYRAMID	Pyramid Technoplast Limited	NSE	Information Technology	\N	142.30	143.20	144.80	137.01	12484	0.00	2026-04-02 09:13:49.257
RADHIKAJWE	Radhika Jeweltech Limited	NSE	Information Technology	\N	55.73	56.53	57.00	52.40	252573	0.00	2026-04-02 09:13:49.279
RAJMET	Rajnandini Metal Limited	NSE	Equities	\N	3.29	3.15	3.30	3.02	243198	0.00	2026-04-02 09:13:49.297
RAMAPHO	Rama Phosphates Limited	NSE	Equities	\N	113.79	112.39	117.00	107.61	68314	0.00	2026-04-02 09:13:49.314
RANASUG	Rana Sugars Limited	NSE	Equities	\N	12.09	12.28	12.30	11.80	186280	0.00	2026-04-02 09:13:49.332
RAYMONDLSL	Raymond Lifestyle Limited	NSE	Equities	\N	777.00	786.45	786.45	749.55	78272	0.00	2026-04-02 09:13:49.347
REDINGTON	Redington Limited	NSE	Equities	\N	198.33	202.45	200.33	191.31	7137593	0.00	2026-04-02 09:13:52.235
REPL	Rudrabhishek Enterprises Limited	NSE	Equities	\N	74.13	69.30	76.39	66.43	15553	0.00	2026-04-02 09:13:52.27
RHETAN	Rhetan TMT Limited	NSE	Equities	\N	24.70	24.60	25.11	24.41	557085	0.00	2026-04-02 09:13:52.284
RHIM	RHI MAGNESITA INDIA LIMITED	NSE	Equities	\N	360.80	364.15	364.70	350.85	51641	0.00	2026-04-02 09:13:52.287
RKDL	Ravi Kumar Distilleries Limited	NSE	Equities	\N	19.58	19.30	19.69	18.67	12274	0.00	2026-04-02 09:13:52.307
ROML	Raj Oil Mills Limited	NSE	Equities	\N	40.67	39.91	41.39	38.20	2115	0.00	2026-04-02 09:13:52.334
RPEL	Raghav Productivity Enhancers Limited	NSE	Equities	\N	622.95	625.65	629.90	601.90	19548	0.00	2026-04-02 09:13:52.353
RSL	Rajputana Stainless Limited	NSE	Equities	\N	120.59	108.09	121.60	104.00	1262993	0.00	2026-04-02 09:13:55.231
RUBFILA	Rubfila International Limited	NSE	Equities	\N	64.00	61.98	64.00	61.00	20042	0.00	2026-04-02 09:13:55.249
VAISHALI	Vaishali Pharma Limited	NSE	Pharmaceuticals	\N	6.10	5.85	6.17	5.32	334433	0.00	2026-04-02 09:14:19.329
VASWANI	Vaswani Industries Limited	NSE	Equities	\N	52.40	51.83	53.40	50.01	64477	0.00	2026-04-02 09:14:19.352
TITAN	Titan Company Limited	NSE	Consumer Goods	\N	4077.10	4065.50	4095.00	3944.70	986895	0.00	2026-04-02 09:14:13.375
VENUSREM	Venus Remedies Limited	NSE	Equities	\N	904.10	861.05	904.10	831.10	59044	0.00	2026-04-02 09:14:19.451
VGUARD	V-Guard Industries Limited	NSE	Equities	\N	320.85	315.70	325.20	309.00	162742	0.00	2026-04-02 09:14:19.472
SANSTAR	Sanstar Limited	NSE	Equities	\N	77.50	76.16	77.87	74.30	103845	0.00	2026-04-02 09:13:58.232
SBGLP	Suratwwala Business Group Limited	NSE	Equities	\N	21.39	20.82	21.60	19.90	36700	0.00	2026-04-02 09:13:58.275
SCILAL	Shipping Corporation of India Land and Assets Limited	NSE	Equities	\N	40.09	39.25	40.62	37.53	407851	0.00	2026-04-02 09:13:58.296
SELMC	SEL Manufacturing Company Limited	NSE	Equities	\N	28.60	28.15	29.49	28.16	4519	0.00	2026-04-02 09:13:58.319
SETL	Standard Engineering Technology Limited	NSE	Information Technology	\N	125.99	121.40	128.69	115.51	318902	0.00	2026-04-02 09:13:58.341
SHAHALLOYS	Shah Alloys Limited	NSE	Equities	\N	59.71	58.39	59.71	57.42	1641	0.00	2026-04-02 09:13:58.364
SHAILY	Shaily Engineering Plastics Limited	NSE	Chemicals	\N	2064.00	2094.20	2085.80	2001.80	110701	0.00	2026-04-02 09:13:58.367
SHANTIGEAR	Shanthi Gears Limited	NSE	Equities	\N	445.90	439.95	446.95	429.05	8954	0.00	2026-04-02 09:14:01.249
SHEMAROO	Shemaroo Entertainment Limited	NSE	Equities	\N	84.44	84.89	86.90	81.01	6679	0.00	2026-04-02 09:14:01.269
SHIVAUM	Shiv Aum Steels Limited	NSE	Metals & Mining	\N	331.00	344.05	360.90	327.80	160	0.00	2026-04-02 09:14:01.289
SHYAMCENT	Shyam Century Ferrous Limited	NSE	Equities	\N	4.05	3.86	4.05	3.88	68692	0.00	2026-04-02 09:14:01.333
SIGNPOST	Signpost India Limited	NSE	Equities	\N	228.79	231.11	230.73	223.35	11360	0.00	2026-04-02 09:14:01.357
SILVERTUC	Silver Touch Technologies Limited	NSE	Information Technology	\N	114.43	108.99	114.43	105.72	151441	0.00	2026-04-02 09:14:01.377
SKFINDIA	SKF India Limited	NSE	Equities	\N	1528.60	1517.10	1543.40	1462.00	19274	0.00	2026-04-02 09:14:04.256
SMARTWORKS	Smartworks Coworking Spaces Limited	NSE	Equities	\N	376.80	382.70	381.90	371.00	24625	0.00	2026-04-02 09:14:04.273
SMCGLOBAL	SMC Global Securities Limited	NSE	Equities	\N	59.45	59.54	60.50	56.82	209696	0.00	2026-04-02 09:14:04.275
SOLARA	Solara Active Pharma Sciences Limited	NSE	Pharmaceuticals	\N	471.10	459.10	475.90	442.00	50342	0.00	2026-04-02 09:14:04.298
SONATSOFTW	Sonata Software Limited	NSE	Information Technology	\N	230.24	220.74	233.60	212.55	724551	0.00	2026-04-02 09:14:04.427
SPECTRUM	Spectrum Electrical Industries Limited	NSE	Equities	\N	1429.00	1465.10	1467.40	1410.10	3648	0.00	2026-04-02 09:14:04.458
SRD	Shankar Lal Rampal Dye-Chem Limited	NSE	Equities	\N	44.35	42.94	45.20	40.08	54512	0.00	2026-04-02 09:14:04.478
SSWL	Steel Strips Wheels Limited	NSE	Metals & Mining	\N	187.17	187.90	189.99	179.00	118781	0.00	2026-04-02 09:14:07.236
STARTECK	Starteck Finance Limited	NSE	Equities	\N	238.66	244.93	255.36	233.00	7763	0.00	2026-04-02 09:14:07.257
STLNETWORK	STL Networks Limited	NSE	Equities	\N	18.53	17.39	18.78	16.68	1137748	0.00	2026-04-02 09:14:07.284
STYRENIX	Styrenix Performance Materials Limited	NSE	Equities	\N	1836.20	1847.40	1856.70	1802.60	27026	0.00	2026-04-02 09:14:07.305
SUMEETINDS	Sumeet Industries Limited	NSE	Equities	\N	29.09	29.49	29.49	28.67	52070	0.00	2026-04-02 09:14:07.335
SUNDRMBRAK	Sundaram Brake Linings Limited	NSE	Equities	\N	495.40	497.65	517.00	476.00	1747	0.00	2026-04-02 09:14:07.354
SUPERSPIN	Super Spinning Mills Limited	NSE	Textile	\N	4.41	4.22	4.73	4.12	96518	0.00	2026-04-02 09:14:07.376
SURAKSHA	Suraksha Diagnostic Limited	NSE	Healthcare	\N	245.73	245.27	247.51	237.32	11675	0.00	2026-04-02 09:14:10.239
SUTLEJTEX	Sutlej Textiles and Industries Limited	NSE	Textile	\N	27.92	26.86	28.63	25.72	42452	0.00	2026-04-02 09:14:10.263
SWARAJENG	Swaraj Engines Limited	NSE	Equities	\N	3524.70	3421.40	3562.60	3352.60	13076	0.00	2026-04-02 09:14:10.294
SYNGENE	Syngene International Limited	NSE	Equities	\N	388.80	396.40	393.00	380.05	442910	0.00	2026-04-02 09:14:10.32
TARACHAND	Tara Chand InfraLogistic Solutions Limited	NSE	Equities	\N	57.98	56.31	57.99	55.08	38814	0.00	2026-04-02 09:14:10.343
TATACONSUM	TATA CONSUMER PRODUCTS LIMITED	NSE	Consumer Goods	\N	1036.00	1023.80	1037.00	1007.20	1246545	0.00	2026-04-02 09:14:10.372
TBZ	Tribhovandas Bhimji Zaveri Limited	NSE	Equities	\N	126.74	126.04	128.94	115.32	336899	0.00	2026-04-02 09:14:10.395
TEAMGTY	Team India Guaranty Limited	NSE	Equities	\N	250.00	251.08	264.99	246.00	1418	0.00	2026-04-02 09:14:13.251
TENNIND	Tenneco Clean Air India Limited	NSE	Equities	\N	529.75	531.15	533.40	516.00	221827	0.00	2026-04-02 09:14:13.278
TGBHOTELS	TGB Banquets And Hotels Limited	NSE	Equities	\N	8.22	8.19	8.41	7.98	12746	0.00	2026-04-02 09:14:13.302
THOMASCOTT	Thomas Scott (India) Limited	NSE	Equities	\N	245.00	248.57	248.33	237.40	26158	0.00	2026-04-02 09:14:13.327
TIMETECHNO	Time Technoplast Limited	NSE	Information Technology	\N	166.71	167.53	168.83	161.28	2729132	0.00	2026-04-02 09:14:13.353
TOKYOPLAST	Tokyo Plast International Limited	NSE	Equities	\N	64.11	65.18	66.00	63.00	852	0.00	2026-04-02 09:14:13.399
TRACXN	Tracxn Technologies Limited	NSE	Information Technology	\N	29.20	28.98	29.48	27.48	162943	0.00	2026-04-02 09:14:16.257
TRAVELFOOD	Travel Food Services Limited	NSE	Equities	\N	1270.10	1276.90	1277.00	1239.90	15722	0.00	2026-04-02 09:14:16.267
TRITURBINE	Triveni Turbine Limited	NSE	Equities	\N	459.90	454.05	463.55	440.80	195555	0.00	2026-04-02 09:14:16.29
TTML	Tata Teleservices (Maharashtra) Limited	NSE	Equities	\N	35.77	35.19	36.63	33.17	14939906	0.00	2026-04-02 09:14:16.315
UCOBANK	UCO Bank	NSE	Banking	\N	23.66	23.68	23.87	22.83	6141485	0.00	2026-04-02 09:14:16.355
UGARSUGAR	The Ugar Sugar Works Limited	NSE	Equities	\N	39.27	39.13	39.90	38.57	138712	0.00	2026-04-02 09:14:16.384
UNIDT	United Drilling Tools Limited	NSE	Equities	\N	155.79	154.98	158.00	151.10	7184	0.00	2026-04-02 09:14:16.412
UNITECH	Unitech Limited	NSE	Information Technology	\N	4.28	3.79	4.38	3.68	27199375	0.00	2026-04-02 09:14:19.26
URAVIDEF	Uravi Defence and Technology Limited	NSE	Information Technology	\N	130.81	122.24	134.00	115.50	5810	0.00	2026-04-02 09:14:19.291
UYFINCORP	U. Y. Fincorp Limited	NSE	Equities	\N	12.97	12.88	12.99	12.27	9459	0.00	2026-04-02 09:14:19.317
VADILALIND	Vadilal Industries Limited	NSE	Equities	\N	4250.50	4397.70	4373.00	4222.00	13097	0.00	2026-04-02 09:14:19.324
RHL	Robust Hotels Limited	NSE	Equities	\N	171.61	172.05	171.61	165.30	8593	0.00	2026-04-02 09:13:52.29
ZAGGLE	Zaggle Prepaid Ocean Services Limited	NSE	Equities	\N	230.12	217.49	236.70	212.00	15613777	0.00	2026-04-02 09:14:25.292
VINYLINDIA	Vinyl Chemicals (India) Limited	NSE	Chemicals	\N	189.85	186.59	193.00	180.17	14604	0.00	2026-04-02 09:14:22.258
COROMANDEL	Coromandel International Limited	NSE	Equities	\N	1869.10	1918.70	1895.00	1829.90	203341	0.00	2026-04-02 09:14:52.252
CRAMC	Canara Robeco Asset Management Company Limited	NSE	Financial Services	\N	228.08	233.48	230.17	226.35	284365	0.00	2026-04-02 09:14:52.272
ZFCVINDIA	ZF Commercial Vehicle Control Systems India Limited	NSE	Equities	\N	14229.00	14375.00	14797.00	14058.00	14702	0.00	2026-04-02 09:14:25.313
KRISHNADEF	Krishna Defence And Allied Industries Limited	NSE	Equities	\N	877.25	884.05	911.30	838.70	91012	0.00	2026-04-02 09:15:28.369
LIBAS	Libas Consumer Products Limited	NSE	Consumer Goods	\N	9.83	10.40	10.29	9.41	62198	0.00	2026-04-02 09:15:31.359
ADANIPORTS	Adani Ports and Special Economic Zone Limited	NSE	Equities	\N	1367.90	1385.40	1373.00	1332.60	2473088	0.00	2026-04-02 09:14:28.324
DIGIDRIVE	Digidrive Distributors Limited	NSE	Equities	\N	18.40	18.14	19.60	17.20	43065	0.00	2026-04-02 09:14:55.352
MAXHEALTH	Max Healthcare Institute Limited	NSE	Healthcare	\N	943.45	958.90	958.30	929.05	1459487	0.00	2026-04-02 09:13:28.321
MOLDTECH	Mold-Tek Technologies Limited	NSE	Information Technology	\N	115.00	112.92	116.00	108.41	29407	0.00	2026-04-02 09:13:31.328
SANDHAR	Sandhar Technologies Limited	NSE	Information Technology	\N	453.35	460.40	459.00	441.00	44565	0.00	2026-04-02 09:13:55.366
MSUMI	Motherson Sumi Wiring India Limited	NSE	Equities	\N	36.88	38.20	38.11	36.66	11808870	0.00	2026-04-02 09:13:34.231
SASKEN	Sasken Technologies Limited	NSE	Information Technology	\N	1182.00	1145.00	1202.00	1115.00	24086	0.00	2026-04-02 09:13:58.251
VISHWARAJ	Vishwaraj Sugar Industries Limited	NSE	Equities	\N	4.66	4.55	4.69	4.36	290924	0.00	2026-04-02 09:14:22.278
VMM	Vishal Mega Mart Limited	NSE	Equities	\N	105.56	105.11	106.33	101.50	12219841	0.00	2026-04-02 09:14:22.303
SHAKTIPUMP	Shakti Pumps (India) Limited	NSE	Equities	\N	491.30	494.40	496.60	475.15	495710	0.00	2026-04-02 09:13:58.37
SHREEPUSHK	Shree Pushkar Chemicals & Fertilisers Limited	NSE	Chemicals	\N	308.75	321.05	315.00	306.60	27905	0.00	2026-04-02 09:14:01.312
GENCON	Generic Engineering Construction and Projects Limited	NSE	Equities	\N	43.44	45.17	45.30	42.56	53305	0.00	2026-04-02 09:15:04.388
LOKESHMACH	Lokesh Machines Limited	NSE	Equities	\N	211.65	209.25	216.40	202.90	34771	0.00	2026-04-02 09:15:31.396
NATIONALUM	National Aluminium Company Limited	NSE	Metals & Mining	\N	400.50	399.45	403.40	385.20	7894794	0.00	2026-04-02 09:13:34.319
SPARC	Sun Pharma Advanced Research Company Limited	NSE	Pharmaceuticals	\N	122.46	120.34	124.49	116.12	780683	0.00	2026-04-02 09:14:04.446
GICRE	General Insurance Corporation of India	NSE	Financial Services	\N	374.15	380.10	377.45	363.15	235343	0.00	2026-04-02 09:15:07.251
VSSL	Vardhman Special Steels Limited	NSE	Metals & Mining	\N	226.02	223.88	228.48	215.50	23971	0.00	2026-04-02 09:14:22.324
WELCORP	Welspun Corp Limited	NSE	Equities	\N	837.80	827.80	844.00	805.45	370203	0.00	2026-04-02 09:14:22.367
ORISSAMINE	The Orissa Minerals Development Company Limited	NSE	Metals & Mining	\N	3368.20	3380.60	3380.90	3222.20	11087	0.00	2026-04-02 09:13:40.318
WEWIN	WE WIN LIMITED	NSE	Equities	\N	40.63	40.70	40.66	40.00	285	0.00	2026-04-02 09:14:25.231
ALBERTDAVD	Albert David Limited	NSE	Equities	\N	636.20	616.20	648.90	602.15	4350	0.00	2026-04-02 09:14:31.331
WEWORK	WeWork India Management Limited	NSE	Equities	\N	450.15	454.85	456.70	440.50	50415	0.00	2026-04-02 09:14:25.233
AXISCADES	AXISCADES Technologies Limited	NSE	Information Technology	\N	1560.00	1583.70	1574.70	1511.00	86354	0.00	2026-04-02 09:14:40.328
BAJFINANCE	Bajaj Finance Limited	NSE	Equities	\N	820.45	817.30	825.65	792.45	7117727	0.00	2026-04-02 09:14:40.373
TATATECH	Tata Technologies Limited	NSE	Information Technology	\N	538.35	531.05	543.00	517.00	789164	0.00	2026-04-02 09:14:10.386
GREENLAM	Greenlam Industries Limited	NSE	Equities	\N	218.99	218.50	224.98	215.81	42160	0.00	2026-04-02 09:15:10.263
BLUESTONE	BlueStone Jewellery and Lifestyle Limited	NSE	Consumer Goods	\N	429.20	453.30	449.70	428.50	220738	0.00	2026-04-02 09:14:46.239
CANHLIFE	Canara HSBC Life Insurance Company Limited	NSE	Financial Services	\N	144.09	144.38	144.63	139.54	237451	0.00	2026-04-02 09:14:46.324
VALIANTLAB	Valiant Laboratories Limited	NSE	Equities	\N	56.15	56.94	57.53	54.74	26089	0.00	2026-04-02 09:14:19.335
HUDCO	Housing & Urban Development Corporation Limited	NSE	Equities	\N	166.41	168.03	167.79	161.00	2705904	0.00	2026-04-02 09:15:16.271
QPOWER	Quality Power Electrical Equipments Limited	NSE	Equities	\N	859.70	866.80	864.80	820.00	747257	0.00	2026-04-02 09:13:49.259
RELCHEMQ	Reliance Chemotex Industries Limited	NSE	Equities	\N	110.26	110.01	112.99	110.10	1340	0.00	2026-04-02 09:13:52.251
WIPL	The Western India Plywoods Limited	NSE	Equities	\N	150.00	150.00	152.00	147.11	198	0.00	2026-04-02 09:14:25.249
XELPMOC	Xelpmoc Design And Tech Limited	NSE	Information Technology	\N	93.30	89.03	98.40	88.01	34421	0.00	2026-04-02 09:14:25.271
JUBLFOOD	Jubilant Foodworks Limited	NSE	Equities	\N	443.55	443.70	444.80	431.00	1482132	0.00	2026-04-02 09:15:25.289
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, clerk_id, email, name, profile_photo, is_admin, is_blocked, created_at, updated_at) FROM stdin;
1	user_3BlBBF0PS2TGqmqbqyJHumK1pXK	Preeku.com@gmail.com	kundan kumar	\N	t	f	2026-04-02 06:07:03.339066	2026-04-02 06:09:04.735
4	mobile_s7664ld3vj8rvwz5vy80	kundan7781@gmail.com	kundan7781	\N	f	f	2026-04-02 07:05:51.990243	2026-04-02 07:05:51.990243
5	mobile_olpkrumpew0iwbqlkvm3	kundansinghofficial@gmail.com	kundansinghofficial	\N	f	f	2026-04-02 07:29:54.52951	2026-04-02 07:29:54.52951
6	mobile_6t243ybdd6c434cu0uxi	kundansinghofficial@gmail.com	kundansinghofficial	\N	f	f	2026-04-02 07:31:30.702223	2026-04-02 07:31:30.702223
7	mobile_c4h28qsv5fq8ypxmw9rt	kundan7781@gmail.com	kundan7781	\N	f	f	2026-04-02 08:17:25.151897	2026-04-02 08:17:25.151897
\.


--
-- Data for Name: wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet (id, user_id, balance, initial_balance, updated_at) FROM stdin;
1	user_3BlBBF0PS2TGqmqbqyJHumK1pXK	87691.00	100000.00	2026-04-02 06:44:03.919
2	mobile_s7664ld3vj8rvwz5vy80	10840.00	100000.00	2026-04-02 07:07:23.54
3	mobile_olpkrumpew0iwbqlkvm3	100000.00	100000.00	2026-04-02 07:29:54.533698
5	mobile_c4h28qsv5fq8ypxmw9rt	67825.00	100000.00	2026-04-02 08:18:00.805
4	mobile_6t243ybdd6c434cu0uxi	3465.00	100000.00	2026-04-02 08:34:14.089
\.


--
-- Data for Name: watchlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watchlist (id, user_id, symbol, added_at) FROM stdin;
\.


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 8, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallet_id_seq', 5, true);


--
-- Name: watchlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watchlist_id_seq', 1, false);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (symbol);


--
-- Name: users users_clerk_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallet wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet
    ADD CONSTRAINT wallet_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_user_id_symbol_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_symbol_unique UNIQUE (user_id, symbol);


--
-- PostgreSQL database dump complete
--

\unrestrict haXzeD4cnHECtyhYJ7yJ3cSlN0wd06eavY907KaFXurfRasWmtTq7mMxSaXGUwI

