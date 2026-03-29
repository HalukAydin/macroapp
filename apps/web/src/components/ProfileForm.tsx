import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "../app/profileSchema";
import { useProfileStore, toDefaults } from "../store/useProfileStore";

export default function ProfileForm() {
  const current = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toDefaults(current)
  });

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
  };

  return (
    <form onSubmit={handleSubmit(onValid)} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <h2>Profile</h2>

      <label>
        Sex
        <select {...register("sex")}>
          <option value="male">male</option>
          <option value="female">female</option>
        </select>
      </label>

      <label>
        Age
        <input type="number" {...register("age", { valueAsNumber: true })} />
      </label>

      <label>
        Height (cm)
        <input type="number" {...register("heightCm", { valueAsNumber: true })} />
      </label>

      <label>
        Weight (kg)
        <input type="number" step="0.1" {...register("weightKg", { valueAsNumber: true })} />
      </label>

      <label>
        Activity
        <select {...register("activity")}>
          <option value="sedentary">sedentary</option>
          <option value="light">light</option>
          <option value="moderate">moderate</option>
          <option value="active">active</option>
          <option value="very_active">very_active</option>
        </select>
      </label>

      <label>
        Goal
        <select {...register("goal")}>
          <option value="cut">cut</option>
          <option value="maintain">maintain</option>
          <option value="bulk">bulk</option>
        </select>
      </label>

      <label>
        Protein (g/kg)
        <input type="number" step="0.1" {...register("proteinGPerKg", { valueAsNumber: true })} />
      </label>

      <label>
        Fat min (g/kg)
        <input type="number" step="0.1" {...register("fatMinGPerKg", { valueAsNumber: true })} />
      </label>

      {Object.keys(errors).length > 0 && (
        <pre style={{ background: "#111", color: "#f88", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(errors, null, 2)}
        </pre>
      )}

      <button type="submit">Save</button>
    </form>
  );
}