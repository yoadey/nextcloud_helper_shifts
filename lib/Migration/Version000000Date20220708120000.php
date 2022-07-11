<?php

  namespace OCA\Helpershifts\Migration;

  use Closure;
  use OCP\DB\ISchemaWrapper;
  use OCP\Migration\SimpleMigrationStep;
  use OCP\Migration\IOutput;

  class Version000000Date20220708120000 extends SimpleMigrationStep {

    /**
    * @param IOutput $output
    * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
    * @param array $options
    * @return null|ISchemaWrapper
    */
    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if (!$schema->hasTable('helpershift_shift')) {
            $table = $schema->createTable('helpershift_shift');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('title', 'string', [
                'notnull' => true,
                'length' => 200
            ]);
            $table->addColumn('user_id', 'string', [
                'notnull' => true,
                'length' => 200,
            ]);
            $table->addColumn('start', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('end', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('comment', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('created_by', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('created_on', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('updated_by', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('updated_on', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);

            $table->setPrimaryKey(['id']);
            $table->addIndex(['user_id'], 'shift_user_id_index');
            $table->addIndex(['start'], 'shift_start_index');
        }

        if (!$schema->hasTable('helpershift_slot')) {
            $table = $schema->createTable('helpershift_slot');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('title', 'string', [
                'notnull' => true,
                'length' => 200
            ]);
            $table->addColumn('start', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('end', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('comment', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('created_by', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('created_on', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('updated_by', 'text', [
                'notnull' => true,
                'default' => ''
            ]);
            $table->addColumn('updated_on', 'datetime', [
                'notnull' => true,
                'default' => ''
            ]);

            $table->setPrimaryKey(['id']);
            $table->addIndex(['start'], 'shift_start_index');
        }
        return $schema;
    }
}