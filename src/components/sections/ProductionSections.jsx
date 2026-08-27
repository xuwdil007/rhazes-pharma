import React, { useEffect, useState } from "react";
import { ArrowRight, PackageCheck, X } from "lucide-react";
import { Eyebrow } from "../ui/SiteUi.jsx";

export function TabletProductionSection() {
  return (
    <section className="lab">
      <div>
        <PackageCheck />
      </div>
      <div>
        <Eyebrow>Производство твёрдых форм</Eyebrow>
        <h2>
          Производство <em>таблеток</em>
        </h2>
        <p>
          Участок производства таблеток РАЗЕС ФАРМА предназначен для выпуска
          современных твёрдых лекарственных форм в виде таблеток различного
          терапевтического назначения. Производственный процесс включает полный
          цикл изготовления продукции: от подготовки исходного сырья до
          получения готовых таблеток, их контроля качества и упаковки.
        </p>
        <p>
          Организация участка выполнена с учётом современных требований
          фармацевтического производства и принципов GMP. Разделение
          производственных зон, контроль потоков сырья, персонала и готовой
          продукции обеспечивают высокую степень защиты продукции и
          предотвращают риск перекрёстной контаминации между различными
          препаратами.
        </p>
        <div className="chips">
          {[
            "Подготовка сырья",
            "Полный производственный цикл",
            "Таблетирование",
            "Принципы GMP",
            "Контроль качества",
            "Упаковка",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
export function HvacSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <section className="product-note product-note-rich">
        <div className="product-note-copy">
          <Eyebrow>Инженерные системы</Eyebrow>
          <h2>
            Система вентиляции и <em>воздухоподготовки (HVAC)</em>
          </h2>
          <p>
            Система HVAC является одной из наиболее важных инженерных систем
            фармацевтического предприятия. Стабильная работа HVAC необходима для
            обеспечения требуемых условий производства и лабораторного контроля.
          </p>
          <button
            className="btn hvac-details-btn"
            type="button"
            onClick={() => setOpen(true)}
          >
            Подробнее о HVAC <ArrowRight size={18} />
          </button>
        </div>
        <div className="product-impact">
          {[
            [
              "01",
              "Контролируемая среда",
              "Чистота воздуха, температура, влажность, воздухообмен и необходимое давление между помещениями.",
            ],
            [
              "02",
              "Очистка воздуха",
              "Удаление пылевых частиц, механических загрязнений и посторонних примесей.",
            ],
            [
              "03",
              "Параметры помещений",
              "Контроль температуры, относительной влажности и кратности воздухообмена.",
            ],
            [
              "04",
              "Движение воздуха",
              "Контроль направления движения воздуха для поддержания требуемых условий производства и лабораторного контроля.",
            ],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <div
        className="hvac-modal-backdrop"
        role="presentation"
        data-cms-block
        data-cms-name="Подробная информация HVAC"
        hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <article
          className="hvac-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hvac-modal-title"
        >
          <button
            className="hvac-modal-close"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
          <h2 id="hvac-modal-title">
            Система вентиляции и <em>воздухоподготовки (HVAC)</em>
          </h2>
          <div className="hvac-modal-grid">
            <section>
              <small>18.1</small>
              <h3>Роль HVAC в фармацевтическом комплексе</h3>
              <p>
                Система HVAC является одной из наиболее важных инженерных систем
                фармацевтического предприятия. Она обеспечивает контролируемые
                параметры окружающей среды:
              </p>
              <ul>
                <li>чистоту воздуха;</li>
                <li>температуру;</li>
                <li>влажность;</li>
                <li>воздухообмен;</li>
                <li>необходимое давление между помещениями.</li>
              </ul>
              <p>
                Стабильная работа HVAC необходима для обеспечения требуемых
                условий производства и лабораторного контроля.
              </p>
            </section>
            <section>
              <small>18.2</small>
              <h3>Основные функции системы HVAC</h3>
              <p>
                Система воздухоподготовки обеспечивает очистку воздуха и
                удаление:
              </p>
              <ul>
                <li>пылевых частиц;</li>
                <li>механических загрязнений;</li>
                <li>посторонних примесей.</li>
              </ul>
              <p>При поддержании параметров помещений контролируются:</p>
              <ul>
                <li>температура;</li>
                <li>относительная влажность;</li>
                <li>кратность воздухообмена;</li>
                <li>направление движения воздуха.</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
