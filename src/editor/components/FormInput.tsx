import * as React from 'react';

export interface IField {
  type: 'text' | 'boolean';
  label: string;
  name: string;
  value: any;
  validate?(value: any): string;
}

interface IProps {
  className?: string;
  fields: IField[];
  title: string;
  onSubmit?(data: { [key: string]: any }): void;
  submitText?: string;
}

let countForId = 0;

function getCount() {
  return countForId++;
}

export default function FormInput(props: IProps) {
  const { className, fields, title, onSubmit, submitText } = props;
  const refs = React.useRef<{[key: string]: HTMLInputElement | null}>({});
  const count = React.useRef(getCount());
  const [errors, setError] = React.useState<{ [key: string]: string }>({});

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();

    const values = fields.reduce((acc, field) => {
      const node = refs.current[field.name]!;
      acc[field.name] = field.type === 'boolean' ? node.checked : node.value;
      return acc;
    }, {} as {[key: string]: string | boolean});

    if (onSubmit) {
      onSubmit(values);
    }
  }

  function setRef(name: string, node: HTMLInputElement | null) {
    refs.current[name] = node;
  }

  React.useEffect(() => {
    refs.current[fields[0].name]?.select();
  }, []);

  return (
    <form className={className} onSubmit={handleSubmit} title={title} style={{minWidth: 400}}>
      {fields.map((field) => {
        const id = `render-${count.current}-${field.name}`;
        const className = field.type === 'boolean' ? 'my-1 block' : 'my-1 block w-full text-xs';
        return (
          <div key={field.name}>
            <label className="block text-xs" htmlFor={id}>
              <span>{field.label}</span>
              <input
                id={id}
                className={className}
                type={field.type === 'boolean' ? 'checkbox' : field.type}
                defaultValue={field.type === 'boolean' ? undefined : field.value}
                defaultChecked={field.type === 'boolean' ? field.value : undefined}
                ref={(node) => setRef(field.name, node)}
              />
            </label>
            {errors[field.name] && <span>{errors[field.name]}</span>}
          </div>
        );
      })}
      <button type="submit" className="rounded-sm border border-gray-500 px-2 py-1">
        {submitText || 'Done'}
      </button>
    </form>
  );
}