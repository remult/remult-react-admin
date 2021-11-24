import React, { cloneElement, memo,  ReactElement, useContext, useMemo } from 'react';
import { BooleanField, BooleanInput, Button, Create, CreateButton, Datagrid, DateField, DateInput, Edit, ExportButton, FilterButton, FilterContext, List, ListActionsProps, Resource, SimpleForm, TextField, TextInput, TopToolbar, useListContext } from 'react-admin';
import { IdEntity, FieldMetadata, Repository, FieldsMetadata } from "remult";
import {
    sanitizeListRestProps, useResourceContext,
    useResourceDefinition,
    useRefresh
} from 'ra-core';

export class raBuilder<entityType> {
    controls = new Map<FieldMetadata, {
        list: (props?: any) => ReactElement;
        edit: (props?: any) => ReactElement;
        filter?: string;

    }>();
    private fields = [...this.repo.metadata.fields];
    constructor(private repo: Repository<entityType>) {
        let stam = repo.create();
        for (const f of this.fields) {
            let fieldProps = {
                key: f.key,
                source: f.key,
                label: f.caption
            };
            let type = f.valueType;
            if (type === undefined) {
                if (typeof (stam as any)[f.key] == "boolean") {
                    type = Boolean;
                }
                if ((stam as any)[f.key] instanceof Date) {
                    type = Date;
                }
            }
            switch (type) {
                case Boolean:
                    this.controls.set(f, {
                        list: (props) => React.createElement(BooleanField, { ...fieldProps, ...props }),
                        edit: (props) => React.createElement(memo(BooleanInput), { ...fieldProps, ...props }),
                    });
                    break;
                case Date: {
                    this.controls.set(f, {
                        list: (props) => React.createElement(DateField, { ...fieldProps, ...props }),
                        edit: (props) => React.createElement(memo(DateInput), { ...fieldProps, ...props }),
                    });
                    break;
                }
                default: {
                    this.controls.set(f, {
                        list: (props) => React.createElement(TextField, { ...fieldProps, ...props }),
                        edit: (props) => React.createElement(memo(TextInput), { ...fieldProps, ...props }),
                        filter: "$contains"
                    });
                }
            }
        }
        if (stam instanceof IdEntity) {
            this.fields = this.fields.filter(x => x.key !== 'id');
        }
    }
    buildListActions(actions?: Action[]) {
        return (props: ListActionsProps) => {
            const { className, exporter, filters: filtersProp, ...rest } = props;
            const {
                currentSort, displayedFilters, filterValues, basePath, selectedIds, showFilter, total,
            } = useListContext(props);
            const resource = useResourceContext(rest);
            const { hasCreate } = useResourceDefinition(rest);
            const filters = useContext(FilterContext) || filtersProp;
            const refresh = useRefresh();
            return useMemo(
                () => (
                    React.createElement(memo(TopToolbar), { className, ...sanitizeListRestProps(rest) },
                        filtersProp
                            ? cloneElement(filtersProp, {
                                resource,
                                showFilter,
                                displayedFilters,
                                filterValues,
                                context: 'button',
                            })
                            : filters && React.createElement(memo(FilterButton)),
                        actions?.map((b, i) => (
                            React.createElement(memo(Button), {
                                key: i,
                                onClick: () => {
                                    b.click(() => refresh());
                                },
                                label: b.label
                            },
                                React.createElement(b.icon)
                            )
                        ))
                        ,
                        hasCreate && React.createElement(memo(CreateButton), { basePath }),
                        exporter !== false && (

                            React.createElement(memo(ExportButton), {
                                disabled: total === 0,

                                resource,
                                sort: currentSort,
                                filterValues
                            }
                            ))
                    )
                ),
                [resource, displayedFilters, filterValues, selectedIds, filters, total] // eslint-disable-line react-hooks/exhaustive-deps
            );
        };

    }
    private getFields(selector?: FieldSelector<entityType>) {
        let r = this.fields;
        if (selector)
            r = selector(this.repo.metadata.fields);
        return r;

    }
    buildEdit(fields?: FieldSelector<entityType>) {
        const edit: React.FC = (props: any) => {
            return (
                React.createElement(memo(Edit), { ...props },
                    React.createElement(memo(SimpleForm), undefined,
                        ...this.getFields(fields).map(f => this.controls.get(f)?.edit())))

            );
        };
        return edit;
    }
    buildCreate(fields?: FieldSelector<entityType>) {
        const edit: React.FC = (props: any) => {
            return (
                React.createElement(memo(Create), { ...props },
                    React.createElement(memo(SimpleForm), undefined,
                        ...this.getFields(fields).map(f => this.controls.get(f)?.edit())
                    )
                ));
        };
        return edit;
    }
    buildFilter(fields?: FieldSelector<entityType>) {
        const filter = [] as ReactElement[];
        for (const f of this.getFields(fields)) {
            let props: any = {};
            let c = this.controls.get(f)!;
            if (c.filter) {
                props.source = f.key + "." + c.filter;
            }
            if (filter.length === 0)
                props.alwaysOn = true;
            filter.push(c.edit(props));
        }
        return filter;
    }


    buildResource(options?: {
        listFields?: FieldSelector<entityType>,
        editFields?: FieldSelector<entityType>,
        createFields?: FieldSelector<entityType>,
        filterFields?: FieldSelector<entityType>,
        actions?: Action[]
    }) {
        const ListActions = this.buildListActions(options?.actions);
        const edit = this.buildEdit(options?.editFields);
        const create = this.buildCreate(options?.createFields);
        const filter = this.buildFilter(options?.filterFields);

        const list = (props: any) => {
            return (
                React.createElement(memo(List), {
                    ...props,
                    filters: filter,
                    actions: React.createElement(memo(ListActions))
                },
                    React.createElement(Datagrid, { rowClick: "edit" },
                        ...this.getFields(options?.listFields).map(f => this.controls.get(f)?.list())
                    )
                )
            );
        };
        return React.createElement(memo(Resource), { name: "tasks", list, edit, create });

    }
}
export interface Action {
    label: string;
    click: (refreshList: () => void) => void;
    icon?: any
}
export type FieldSelector<entityType> = (fields: FieldsMetadata<entityType>) => FieldMetadata[];