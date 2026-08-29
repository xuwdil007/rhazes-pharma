import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Cpu,
  Droplets,
  Factory,
  FlaskConical,
  HeartPulse,
  Leaf,
  Mail,
  MapPin,
  Microscope,
  PackageCheck,
  Phone,
  Send,
  ShieldCheck,
  Wind,
  X,
} from "lucide-react";
import { productGroups } from "../data/siteContent.js";
import { Layout } from "../components/layout/SiteLayout.jsx";
import {
  Btn,
  Capability,
  Eyebrow,
  PageHero,
  Value,
} from "../components/ui/SiteUi.jsx";
import {
  HvacSection,
  TabletProductionSection,
} from "../components/sections/ProductionSections.jsx";

export function Home() {
  return (
    <Layout>
      <section className="hero">
        <img src={`${import.meta.env.BASE_URL}assets/pharma-hero.png`} />
        <div className="hero-shade" />
        <div className="hero-content">
          <Eyebrow>Фармацевтика нового поколения</Eyebrow>
          <h1>
            Технологии,
            <br />
            создающие <em>здоровье</em>
          </h1>
          <p>
            Современный фармацевтический комплекс полного цикла, где качество
            заложено в каждый процесс.
          </p>
          <div className="hero-actions">
            <Btn to="/about">О компании</Btn>
            <Btn to="/production" ghost>
              Наше производство
            </Btn>
          </div>
        </div>
        <div className="hero-note">
          <span>01</span>
          <p>
            Производство лекарственных препаратов по современным международным
            принципам
          </p>
        </div>
      </section>
      <section className="intro section">
        <div>
          <Eyebrow>О проекте</Eyebrow>
          <h2>
            Новая фармацевтическая платформа <em>страны</em>
          </h2>
        </div>
        <div>
          <p className="lead">
            РАЗЕС ФАРМА объединяет современные технологии, инженерную
            инфраструктуру, лабораторный контроль и профессиональную команду в
            единую промышленную систему.
          </p>
          <Btn to="/about">История компании</Btn>
        </div>
      </section>
      <section className="directions section">
        <div className="section-head">
          <div>
            <Eyebrow>Производственные возможности</Eyebrow>
            <h2>
              Четыре формы.
              <br />
              <em>Единый стандарт.</em>
            </h2>
          </div>
          <p>
            Гибкая производственная платформа позволяет выпускать широкий спектр
            лекарственных препаратов.
          </p>
        </div>
        <div className="cap-grid">
          <Capability
            n="01"
            title="Таблетки"
            value="1,4 млрд"
            image={`${import.meta.env.BASE_URL}assets/form-tablets.png`}
          />
          <Capability
            n="02"
            title="Капсулы"
            value="300 млн"
            image={`${import.meta.env.BASE_URL}assets/form-capsules.png`}
          />
          <Capability
            n="03"
            title="Жидкие препараты"
            value="21 млн"
            image={`${import.meta.env.BASE_URL}assets/form-liquid.png`}
          />
          <Capability
            n="04"
            title="Мази, кремы и гели"
            value="13 млн"
            image={`${import.meta.env.BASE_URL}assets/form-topical.png`}
          />
        </div>
      </section>
      <section className="quality-call">
        <div>
          <Eyebrow>Философия качества</Eyebrow>
          <h2>
            Качество формируется <em>на каждом этапе</em>
          </h2>
          <p>
            От выбора сырья и проектирования процессов — до лабораторного
            контроля готовой продукции.
          </p>
          <Btn to="/quality">Система качества</Btn>
        </div>
        <div className="quality-orbit">
          <ShieldCheck />
          <span>GMP</span>
          <small>
            ориентированное
            <br />
            производство
          </small>
        </div>
      </section>
      <section className="values section">
        <div className="section-head">
          <div>
            <Eyebrow>Наши принципы</Eyebrow>
            <h2>
              Основа устойчивого <em>развития</em>
            </h2>
          </div>
        </div>
        <div className="value-grid">
          <Value
            icon={<Cpu />}
            t="Технологичность"
            d="Современные производственные решения и автоматизация процессов."
          />
          <Value
            icon={<ShieldCheck />}
            t="Качество"
            d="Ответственность каждого подразделения и полная прослеживаемость."
          />
          <Value
            icon={<Factory />}
            t="Надёжность"
            d="Устойчивая инженерная и производственная инфраструктура."
          />
          <Value
            icon={<Leaf />}
            t="Развитие"
            d="Платформа для расширения и освоения новых направлений."
          />
        </div>
      </section>
    </Layout>
  );
}
export function About() {
  return (
    <Layout>
      <PageHero
        eyebrow="О компании"
        title={
          <>
            Создаём будущее
            <br />
            <em>фармацевтики</em>
          </>
        }
        text="Долгосрочный промышленный проект, направленный на развитие отечественного производства и технологического потенциала страны."
        note="РАЗЕС ФАРМА представляет собой комплексный фармацевтический проект, направленный на создание современной производственной базы по выпуску лекарственных препаратов различных лекарственных форм."
      />
      <section className="story section split">
        <div>
          <Eyebrow>Наша история</Eyebrow>
          <h2>
            От концепции —<br />к комплексу <em>нового поколения</em>
          </h2>
        </div>
        <div>
          <p className="lead">
            22 января 2022 года началась реализация проекта РАЗЕС ФАРМА. Каждый
            этап — от проектирования помещений до формирования команды —
            подчинён единой цели: выпуску качественных и безопасных
            лекарственных препаратов.
          </p>
          <p>
            С этого периода была начата работа по созданию современного
            фармацевтического комплекса, ориентированного на применение
            современных подходов организации производства лекарственных
            препаратов.
          </p>
          <p>В процессе реализации проекта особое внимание уделялось:</p>
          <ul className="story-focus">
            <li>
              <Check />
              Правильной организации производственных потоков
            </li>
            <li>
              <Check />
              Созданию необходимых инженерных систем
            </li>
            <li>
              <Check />
              Обеспечению условий для стабильной работы оборудования
            </li>
            <li>
              <Check />
              Формированию лабораторного комплекса
            </li>
            <li>
              <Check />
              Подготовке специалистов различных направлений
            </li>
          </ul>
        </div>
      </section>
      <section className="timeline section">
        <Eyebrow>Путь развития</Eyebrow>
        <div className="timeline-line">
          <div>
            <b>2022</b>
            <h3>Старт проекта</h3>
            <p>
              Разработка концепции современного фармацевтического комплекса.
            </p>
          </div>
          <div>
            <b>2023–25</b>
            <h3>Создание инфраструктуры</h3>
            <p>Производственные зоны, инженерные системы и лаборатории.</p>
          </div>
          <div>
            <b>2026</b>
            <h3>Формирование платформы</h3>
            <p>
              Оснащение, цифровизация и подготовка профессиональной команды.
            </p>
          </div>
          <div>
            <b>Далее</b>
            <h3>Масштабирование</h3>
            <p>Новые лекарственные формы и выход на зарубежные рынки.</p>
          </div>
        </div>
      </section>
      <section className="national">
        <div>
          <Eyebrow>Значение для страны</Eyebrow>
          <h2>
            Инвестиции в <em>лекарственную безопасность</em>
          </h2>
        </div>
        <div>
          <p>
            Собственное современное производство снижает зависимость от внешних
            поставок, создаёт квалифицированные рабочие места и развивает
            инженерные и научные компетенции.
          </p>
          <Btn to="/contacts">Стать частью команды</Btn>
        </div>
      </section>
    </Layout>
  );
}
export function Production() {
  return (
    <Layout>
      <PageHero
        eyebrow="Производство"
        n="03"
        title={
          <>
            Точность в каждой
            <br />
            <em>операции</em>
          </>
        }
        text="Современные участки, автоматизированные системы и продуманная организация потоков обеспечивают стабильность всех производственных процессов."
        note="Основная идея проекта заключается в создании предприятия нового поколения, где производственные процессы, инженерные системы и система качества объединены в единую управляемую структуру."
      />
      <section className="section">
        <div className="section-head">
          <div>
            <Eyebrow>Производственный цикл</Eyebrow>
            <h2>
              Единая технологическая <em>среда</em>
            </h2>
          </div>
          <p>
            Производственные, инженерные, лабораторные и складские подразделения
            работают как одна управляемая система.
          </p>
        </div>
        <div className="process-grid">
          <Value
            icon={<Factory />}
            t="Твёрдые формы"
            d="Таблетирование, капсулирование и нанесение покрытий."
          />
          <Value
            icon={<Droplets />}
            t="Жидкие формы"
            d="Растворы для наружного и местного применения."
          />
          <Value
            icon={<FlaskConical />}
            t="Мягкие формы"
            d="Технологические линии для мазей, кремов и гелей."
          />
          <Value
            icon={<PackageCheck />}
            t="Упаковка"
            d="Первичная и вторичная упаковка с полной прослеживаемостью."
          />
        </div>
      </section>
      <section className="engineering">
        <div className="eng-photo">
          <img
            src={`${import.meta.env.BASE_URL}assets/engineering-infrastructure.png`}
            alt="Инженерные системы фармацевтического производства"
          />
        </div>
        <div>
          <Eyebrow>Инженерная инфраструктура</Eyebrow>
          <h2>
            Среда под <em>полным контролем</em>
          </h2>
          <p>
            В «РАЗЕС ФАРМА» все инженерные системы объединены в единую
            архитектуру качества и включают:
          </p>
          <ul>
            <li>
              <Droplets /> Систему водоподготовки и получения очищенной воды
            </li>
            <li>
              <Factory /> Автоматизированную систему пароснабжения
            </li>
            <li>
              <Wind /> Современную систему вентиляции, кондиционирования и
              подготовки воздуха (HVAC)
            </li>
            <li>
              <Microscope /> Систему непрерывного мониторинга температуры и
              влажности
            </li>
            <li>
              <ShieldCheck /> Систему основного и резервного электроснабжения
            </li>
            <li>
              <Cpu /> Автоматизированные средства управления инженерными
              коммуникациями
            </li>
          </ul>
        </div>
      </section>
      <section className="digital section">
        <Eyebrow>Цифровая трансформация</Eyebrow>
        <h2>
          SAP объединяет ключевые процессы
          <br />в <em>единую цифровую экосистему</em>
        </h2>
        <div className="digital-row">
          {[
            "Планирование",
            "Материальные потоки",
            "Склад и закупки",
            "Прослеживаемость",
            "Аналитика",
          ].map((x, i) => (
            <div>
              <span>0{i + 1}</span>
              {x}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
export function Quality() {
  const [qaOpen, setQaOpen] = useState(false);
  const [qcOpen, setQcOpen] = useState(false);

  useEffect(() => {
    if (!qaOpen && !qcOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setQaOpen(false);
        setQcOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [qaOpen, qcOpen]);

  return (
    <Layout>
      <PageHero
        eyebrow="Система качества"
        n="04"
        title={
          <>
            Фармацевтическая
            <br />
            <em>система качества</em>
          </>
        }
        text="Система охватывает производственные процессы, документацию, контроль рисков, подготовку персонала и эксплуатацию оборудования."
        note="Качество — формирование системы, в которой качество является ответственностью каждого подразделения."
      />
      <section className="section qa">
        <div>
          <Eyebrow>QA + QC</Eyebrow>
          <h2>
            Разделение функций
            <br />
            <em>QA и QC</em>
          </h2>
        </div>
        <div className="qa-cards">
          <article
            className="qa-trigger"
            role="button"
            tabIndex="0"
            onClick={() => setQaOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setQaOpen(true);
              }
            }}
          >
            <span>QA</span>
            <h3>Обеспечение качества</h3>
            <p>
              Подразделение отвечает за документацию, соблюдение требований GMP,
              управление изменениями и рисками, расследование отклонений, CAPA,
              квалификацию оборудования и валидацию процессов.
            </p>
            <div className="qa-more">
              Подробнее <ArrowRight size={16} />
            </div>
          </article>
          <article
            className="qa-trigger qc-trigger"
            role="button"
            tabIndex="0"
            onClick={() => setQcOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setQcOpen(true);
              }
            }}
          >
            <span>QC</span>
            <h3>Контроль качества</h3>
            <p>
              Подразделение проводит лабораторную оценку сырья, материалов,
              промежуточной продукции и готовых лекарственных средств на
              соответствие установленным требованиям.
            </p>
            <div className="qa-more">
              Подробнее <ArrowRight size={16} />
            </div>
          </article>
        </div>
      </section>
      <div
        className="hvac-modal-backdrop quality-modal-backdrop"
        role="presentation"
        data-cms-block
        data-cms-name="Подробная информация QA"
        hidden={!qaOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setQaOpen(false);
        }}
      >
        <article
          className="hvac-modal quality-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-modal-title"
        >
          <button
            className="hvac-modal-close"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setQaOpen(false)}
          >
            <X />
          </button>
          <span className="hvac-modal-index">QA</span>
          <h2 id="qa-modal-title">
            Отдел обеспечения <em>качества (QA)</em>
          </h2>
          <div className="hvac-modal-grid qa-modal-grid">
            <section className="modal-wide">
              <small>Роль QA</small>
              <h3>Общая система качества предприятия</h3>
              <p>
                Отдел обеспечения качества является подразделением, которое
                отвечает за функционирование общей системы качества предприятия.
              </p>
              <p>
                Основная задача QA: обеспечение управляемости всех процессов,
                влияющих на качество лекарственной продукции. QA осуществляет
                контроль не только конечного результата, но и всей системы
                производства.
              </p>
            </section>
            <section>
              <small>10.1</small>
              <h3>Управление документацией</h3>
              <p>QA обеспечивает:</p>
              <ul>
                <li>разработку документов;</li>
                <li>утверждение процедур;</li>
                <li>контроль актуальности документов;</li>
                <li>управление версиями;</li>
                <li>архивирование записей.</li>
              </ul>
            </section>
            <section>
              <small>Документы</small>
              <h3>Основные документы</h3>
              <ul>
                <li>SOP;</li>
                <li>MFR;</li>
                <li>BMR;</li>
                <li>технологические инструкции;</li>
                <li>журналы производства;</li>
                <li>отчёты.</li>
              </ul>
            </section>
            <section className="modal-wide">
              <small>10.1</small>
              <h3>Управление отклонениями</h3>
              <p>Любое отклонение от установленного процесса должно быть:</p>
              <ul className="qa-deviation-list">
                <li>зарегистрировано;</li>
                <li>изучено;</li>
                <li>оценено;</li>
                <li>документально оформлено.</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
      <div
        className="hvac-modal-backdrop quality-modal-backdrop"
        role="presentation"
        data-cms-block
        data-cms-name="Подробная информация QC"
        hidden={!qcOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setQcOpen(false);
        }}
      >
        <article
          className="hvac-modal quality-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qc-modal-title"
        >
          <button
            className="hvac-modal-close"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setQcOpen(false)}
          >
            <X />
          </button>
          <span className="hvac-modal-index">QC</span>
          <h2 id="qc-modal-title">
            Отдел контроля <em>качества (ОКК/QC)</em>
          </h2>
          <div className="hvac-modal-grid qa-modal-grid">
            <section className="modal-wide">
              <small>Роль ОКК</small>
              <h3>Независимое подразделение контроля</h3>
              <p>
                Отдел контроля качества является независимым подразделением,
                ответственным за проведение лабораторных исследований и
                подтверждение качества продукции.
              </p>
              <p>Основные направления деятельности ОКК:</p>
            </section>
            <section>
              <small>01</small>
              <h3>Контроль поступающего сырья</h3>
              <p>
                Перед использованием в производстве проводится оценка качества
                сырья и материалов. Контролируются:
              </p>
              <ul>
                <li>соответствие сопроводительной документации;</li>
                <li>идентификация материала;</li>
                <li>физико-химические показатели;</li>
                <li>соответствие установленным требованиям.</li>
              </ul>
            </section>
            <section>
              <small>02</small>
              <h3>Контроль в процессе производства</h3>
              <p>
                На различных стадиях производства осуществляется контроль
                промежуточной продукции. Проверяются:
              </p>
              <ul>
                <li>внешний вид;</li>
                <li>однородность;</li>
                <li>физико-химические параметры;</li>
                <li>технологические показатели.</li>
              </ul>
            </section>
            <section className="modal-wide">
              <small>03</small>
              <h3>Контроль готовой продукции</h3>
              <p>
                Перед выпуском каждой серии продукции проводится комплекс
                исследований. Оцениваются:
              </p>
              <ul>
                <li>внешний вид;</li>
                <li>физико-химические характеристики;</li>
                <li>количественное содержание действующих веществ;</li>
                <li>соответствие нормативным требованиям.</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
      <section className="quality-scope section">
        <div className="section-head">
          <div>
            <Eyebrow>Область контроля</Eyebrow>
            <h2>
              Качество на всём
              <br />
              <em>жизненном цикле</em>
            </h2>
          </div>
          <p>
            Контроль начинается до запуска производства и продолжается до
            разрешения на выпуск готовой серии.
          </p>
        </div>
        <div className="quality-flow">
          {[
            [
              "01",
              "Сырьё и материалы",
              "Идентификация и входной контроль поступающих компонентов.",
            ],
            [
              "02",
              "Производственный процесс",
              "Контроль технологических параметров и документирование операций.",
            ],
            [
              "03",
              "Промежуточная продукция",
              "Аналитическая оценка на установленных стадиях производства.",
            ],
            [
              "04",
              "Готовая серия",
              "Подтверждение соответствия перед передачей на склад готовой продукции.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <HvacSection />
      <section className="qualification section">
        <div className="section-head">
          <div>
            <Eyebrow>Квалификация и валидация</Eyebrow>
            <h2>
              Подтверждение
              <br />
              <em>стабильности процессов</em>
            </h2>
          </div>
          <p>
            Оборудование и процессы должны документированно подтверждать
            способность стабильно обеспечивать требуемый результат.
          </p>
        </div>
        <div className="qualification-grid">
          <article>
            <b>IQ</b>
            <h3>Квалификация монтажа</h3>
            <p>
              Проверка установки оборудования, проектной документации и
              необходимых коммуникаций.
            </p>
          </article>
          <article>
            <b>OQ</b>
            <h3>Квалификация функционирования</h3>
            <p>
              Подтверждение правильной работы оборудования и соответствия
              заданным параметрам.
            </p>
          </article>
          <article>
            <b>PQ</b>
            <h3>Квалификация производительности</h3>
            <p>
              Подтверждение стабильной работы оборудования в реальных
              производственных условиях.
            </p>
          </article>
          <article>
            <b>PV</b>
            <h3>Валидация процессов</h3>
            <p>
              Подтверждение способности процесса стабильно выпускать продукцию
              требуемого качества.
            </p>
          </article>
        </div>
      </section>
      <section className="section principles">
        <Eyebrow>Принципы системы</Eyebrow>
        <div className="check-grid">
          {[
            "Ориентация на требования GMP",
            "Управление рисками для качества",
            "Документирование процессов",
            "Полная прослеживаемость серий",
            "Мониторинг критических параметров",
            "Непрерывное совершенствование",
          ].map((x) => (
            <div>
              <Check />
              {x}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
export function Products() {
  return (
    <Layout>
      <PageHero
        eyebrow="Продукция"
        n="05"
        title={
          <>
            Широкий спектр
            <br />
            <em>терапевтических решений</em>
          </>
        }
        text="Производственная платформа ориентирована на актуальные потребности современной медицины и системы здравоохранения."
        note="Ассортимент формируется с учётом актуальных потребностей системы здравоохранения и современных терапевтических направлений."
      />
      <section className="section products-catalog">
        <div className="section-head">
          <div>
            <Eyebrow>Терапевтические направления</Eyebrow>
            <h2>
              Здоровье — в центре
              <br />
              <em>каждого решения</em>
            </h2>
          </div>
          <p>
            Ассортимент включает средства для профилактики, лечения и
            поддерживающей терапии различных заболеваний.
          </p>
        </div>
        <div className="product-list">
          {productGroups.map((item, i) => (
            <article className="product-category" key={item.slug} tabIndex="0">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <HeartPulse />
              <div className="product-tooltip" role="tooltip">
                <small>О категории</small>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <TabletProductionSection />
    </Layout>
  );
}
export function Contacts() {
  useEffect(() => {
    const requestedByUrl = window.location.hash.includes("?form=1");
    if (
      !requestedByUrl &&
      sessionStorage.getItem("scroll-to-contact-form") !== "true"
    ) {
      return undefined;
    }

    const scrollTimer = window.setTimeout(() => {
      const form = document.querySelector("#contact-form");
      if (form) {
        window.scrollTo({
          top: form.getBoundingClientRect().top + window.scrollY - 100,
          behavior: "smooth",
        });
      }
      sessionStorage.removeItem("scroll-to-contact-form");
    }, 350);

    return () => window.clearTimeout(scrollTimer);
  }, []);

  return (
    <Layout>
      <PageHero
        eyebrow="Контакты"
        n="06"
        title={
          <>
            Давайте создавать
            <br />
            <em>будущее вместе</em>
          </>
        }
        text="Открыты для профессионального диалога, технологического сотрудничества и сильных специалистов."
        note="Открыты для профессионального диалога, технологического сотрудничества и взаимодействия со специалистами отрасли."
      />
      <section className="contact section">
        <div className="contact-info">
          <Eyebrow>Связаться с нами</Eyebrow>
          <h2>
            Мы всегда <em>на связи</em>
          </h2>
          <div>
            <MapPin />
            <p>
              <b>Адрес</b>Республика Таджикистан
              <br />
              г. Душанбе
            </p>
          </div>
          <div>
            <Mail />
            <p>
              <b>Электронная почта</b>
              <a href="mailto:info@rhazes.tj">info@rhazes.tj</a>
            </p>
          </div>
          <div>
            <Phone />
            <p>
              <b>Телефон</b>
              <a href="tel:+992000000000">+992 (00) 000-00-00</a>
            </p>
          </div>
        </div>
        <form
          id="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert(
              e.currentTarget.querySelector(".contact-success-copy")
                ?.textContent || "",
            );
          }}
        >
          <span className="contact-success-copy" hidden>
            Спасибо! Сообщение подготовлено к отправке.
          </span>
          <label>
            Ваше имя
            <input required placeholder="Как к вам обращаться?" />
          </label>
          <label>
            Электронная почта
            <input required type="email" placeholder="name@company.com" />
          </label>
          <label>
            Тема
            <select>
              <option>Сотрудничество</option>
              <option>Карьера</option>
              <option>Продукция</option>
              <option>Другое</option>
            </select>
          </label>
          <label>
            Сообщение
            <textarea required placeholder="Расскажите, чем мы можем помочь" />
          </label>
          <button className="btn">
            Отправить сообщение <ArrowRight />
          </button>
          <small>
            Нажимая кнопку, вы соглашаетесь с политикой обработки данных.
          </small>
        </form>
      </section>
    </Layout>
  );
}

const cmsPages = [
  ["Главная", "/"],
  ["О компании", "/about"],
  ["Производство", "/production"],
  ["Качество", "/quality"],
  ["Продукция", "/products"],
  ["Контакты", "/contacts"],
];
