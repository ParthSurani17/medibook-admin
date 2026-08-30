import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaPlus, FaTrash, FaCommentDots, FaQuoteLeft } from "react-icons/fa";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { Input, TextArea } from "../../components/Input";
import { useClinic } from "../../context/ClinicContext";
import { useAppointments } from "../../context/AppointmentContext";
import type { FormErrors } from "../../utils/validators";

interface TestimonialFormValues {
  name: string;
  role: string;
  quote: string;
}

const emptyForm: TestimonialFormValues = { name: "", role: "", quote: "" };

export default function Testimonials() {
  const { testimonials, addTestimonial, deleteTestimonial } = useClinic();
  const { showToast } = useAppointments();
  const [modalOpen, setModalOpen] = useState(false);
  const [values, setValues] = useState<TestimonialFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setValues(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!values.name.trim()) newErrors.name = "Please enter the patient's name.";
    if (!values.role.trim()) newErrors.role = "Please enter a short role/label (e.g. Patient).";
    if (!values.quote.trim()) newErrors.quote = "Please enter the review text.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await addTestimonial({ ...values, avatarSeed: values.name });
      showToast("Testimonial added.", "success");
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add testimonial.", "error");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage Testimonials</h1>
          <p className="mt-1 text-sm text-ink-500">
            "What our patients say" — shown on the public homepage. {testimonials.length}{" "}
            testimonial{testimonials.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button onClick={openAdd} icon={FaPlus}>
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState
          icon={FaCommentDots}
          title="No testimonials yet"
          message="Add a patient review to feature it on the homepage."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-card"
            >
              <FaQuoteLeft className="text-xl text-primary-200" />
              <p className="mt-3 flex-1 text-sm text-ink-600">{t.quote}</p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.avatarSeed || t.name)}`}
                    alt={t.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-400">{t.role}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  icon={FaTrash}
                  onClick={() => setConfirmDeleteId(t.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Testimonial">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="tst-name"
            label="Patient Name"
            value={values.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setValues((p) => ({ ...p, name: e.target.value }))
            }
            error={errors.name}
          />
          <Input
            id="tst-role"
            label="Role / Label"
            placeholder="e.g. Patient, Parent"
            value={values.role}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setValues((p) => ({ ...p, role: e.target.value }))
            }
            error={errors.role}
          />
          <TextArea
            id="tst-quote"
            label="Review"
            rows={4}
            value={values.quote}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setValues((p) => ({ ...p, quote: e.target.value }))
            }
            error={errors.quote}
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Testimonial</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete this testimonial?"
      >
        <p>This will remove it from the public homepage. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirmDeleteId) return;
              await deleteTestimonial(confirmDeleteId);
              setConfirmDeleteId(null);
              showToast("Testimonial deleted.", "info");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
