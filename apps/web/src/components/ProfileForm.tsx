import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { profileSchema, type ProfileFormValues } from "../app/profileSchema";
import { useProfileStore, toDefaults } from "../store/useProfileStore";
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";

type FieldErrorMessageProps = {
  message?: string;
};

function FieldErrorMessage({ message }: FieldErrorMessageProps) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      {message}
    </p>
  );
}

export default function ProfileForm() {
  const { t } = useTranslation();
  const current = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toDefaults(current)
  });

  useEffect(() => {
    if (!saveMessage) return;
    const timer = window.setTimeout(() => setSaveMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  // ⚠️ SADECE data alır, event alamaz
  const onValid = (data: ProfileFormValues) => {
    // ekstra garanti: plain object kopyası
    const clean: ProfileFormValues = {
      sex: data.sex,
      age: data.age,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      activity: data.activity,
      goal: data.goal,
      proteinGPerKg: data.proteinGPerKg,
      fatMinGPerKg: data.fatMinGPerKg
    };

    setProfile(clean);
    setSaveMessage(t("profile.saveSuccess"));
  };

  return (
    <div className="page-stack" style={{ maxWidth: "640px" }}>
      <SectionTitle title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <Card>
        <form onSubmit={handleSubmit(onValid)} className="profile-form-grid">
          <label htmlFor="profile-sex" className="field-label">
            {t("profile.fields.sex.label")}
            <select id="profile-sex" {...register("sex")} aria-invalid={Boolean(errors.sex)}>
              <option value="male">{t("profile.fields.sex.options.male")}</option>
              <option value="female">{t("profile.fields.sex.options.female")}</option>
            </select>
            <FieldErrorMessage message={errors.sex ? t("profile.fields.sex.error") : undefined} />
          </label>

          <label htmlFor="profile-age" className="field-label">
            {t("profile.fields.age.label")}
            <input
              id="profile-age"
              type="number"
              min={13}
              max={90}
              placeholder={t("profile.fields.age.placeholder")}
              {...register("age", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.age)}
            />
            <p className="field-hint">{t("profile.fields.age.hint")}</p>
            <FieldErrorMessage message={errors.age ? t("profile.fields.age.error") : undefined} />
          </label>

          <label htmlFor="profile-height" className="field-label">
            {t("profile.fields.heightCm.label")}
            <input
              id="profile-height"
              type="number"
              min={120}
              max={230}
              placeholder={t("profile.fields.heightCm.placeholder")}
              {...register("heightCm", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.heightCm)}
            />
            <p className="field-hint">{t("profile.fields.heightCm.hint")}</p>
            <FieldErrorMessage
              message={errors.heightCm ? t("profile.fields.heightCm.error") : undefined}
            />
          </label>

          <label htmlFor="profile-weight" className="field-label">
            {t("profile.fields.weightKg.label")}
            <input
              id="profile-weight"
              type="number"
              step="0.1"
              min={35}
              max={250}
              placeholder={t("profile.fields.weightKg.placeholder")}
              {...register("weightKg", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.weightKg)}
            />
            <p className="field-hint">{t("profile.fields.weightKg.hint")}</p>
            <FieldErrorMessage
              message={errors.weightKg ? t("profile.fields.weightKg.error") : undefined}
            />
          </label>

          <label htmlFor="profile-activity" className="field-label">
            {t("profile.fields.activity.label")}
            <select id="profile-activity" {...register("activity")} aria-invalid={Boolean(errors.activity)}>
              <option value="sedentary">{t("profile.fields.activity.options.sedentary")}</option>
              <option value="light">{t("profile.fields.activity.options.light")}</option>
              <option value="moderate">{t("profile.fields.activity.options.moderate")}</option>
              <option value="active">{t("profile.fields.activity.options.active")}</option>
              <option value="very_active">{t("profile.fields.activity.options.very_active")}</option>
            </select>
            <FieldErrorMessage message={errors.activity ? t("profile.fields.activity.error") : undefined} />
          </label>

          <label htmlFor="profile-goal" className="field-label">
            {t("profile.fields.goal.label")}
            <select id="profile-goal" {...register("goal")} aria-invalid={Boolean(errors.goal)}>
              <option value="cut">{t("profile.fields.goal.options.cut")}</option>
              <option value="maintain">{t("profile.fields.goal.options.maintain")}</option>
              <option value="bulk">{t("profile.fields.goal.options.bulk")}</option>
            </select>
            <FieldErrorMessage message={errors.goal ? t("profile.fields.goal.error") : undefined} />
          </label>

          <label htmlFor="profile-protein" className="field-label">
            {t("profile.fields.proteinGPerKg.label")}
            <input
              id="profile-protein"
              type="number"
              step="0.1"
              min={1.2}
              max={3}
              placeholder={t("profile.fields.proteinGPerKg.placeholder")}
              {...register("proteinGPerKg", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.proteinGPerKg)}
            />
            <p className="field-hint">{t("profile.fields.proteinGPerKg.hint")}</p>
            <FieldErrorMessage
              message={errors.proteinGPerKg ? t("profile.fields.proteinGPerKg.error") : undefined}
            />
          </label>

          <label htmlFor="profile-fat" className="field-label">
            {t("profile.fields.fatMinGPerKg.label")}
            <input
              id="profile-fat"
              type="number"
              step="0.1"
              min={0.3}
              max={1.5}
              placeholder={t("profile.fields.fatMinGPerKg.placeholder")}
              {...register("fatMinGPerKg", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.fatMinGPerKg)}
            />
            <p className="field-hint">{t("profile.fields.fatMinGPerKg.hint")}</p>
            <FieldErrorMessage
              message={errors.fatMinGPerKg ? t("profile.fields.fatMinGPerKg.error") : undefined}
            />
          </label>

          {Object.keys(errors).length > 0 ? (
            <p className="feedback feedback-warn" role="alert">
              {t("profile.errors.fixBeforeSave")}
            </p>
          ) : null}

          <button type="submit">{t("profile.saveButton")}</button>

          {saveMessage ? (
            <p className="feedback feedback-success" role="status" aria-live="polite">
              {saveMessage}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
